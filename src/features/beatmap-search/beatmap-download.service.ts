import { inject, Injectable, OnDestroy, signal } from '@angular/core';
import { BeatmapStore } from '@entities/beatmap';
import { UserStore } from '@entities/user';
import { OsuPathStore } from '@shared/stores'; 
import { invoke } from '@tauri-apps/api/core';
import { sendNotification } from '@tauri-apps/plugin-notification';
import { listen, UnlistenFn } from '@tauri-apps/api/event';

interface DownloadProgress {
  beatmapSetId: number;
  progress: number;
  status: 'downloading' | 'done' | 'failed';
}

@Injectable({
  providedIn: 'root',
})
export class BeatmapDownloadService implements OnDestroy {
  private osuPath = inject(OsuPathStore);
  private beatmapStore = inject(BeatmapStore);
  private userStore = inject(UserStore);
  private unlisten?: UnlistenFn;

  readonly error = signal<string | null>(null);

  async startDownload() {
    if (this.beatmapStore.isDownloading()) return;

    const pending = this.beatmapStore.queue().filter(i => i.status === 'pending');
    if (pending.length === 0) return;

    const osuSession = this.userStore.user()?.osuSession;
    if (!osuSession) return;

    this.error.set(null);
    this.beatmapStore.setDownloading(true);

    this.unlisten = await listen<DownloadProgress>('download:progress', (event) => {
      const { beatmapSetId, progress, status } = event.payload;
      this.beatmapStore.updateStatus(beatmapSetId, status, progress);

      if (status === 'failed') {
        this.appendFailedToFile(beatmapSetId);
      }

      if (status === 'done' || status === 'failed') {
        const remaining = this.beatmapStore.queue().filter(i => i.status === 'pending');
        if (remaining.length === 0) {
          this.beatmapStore.setDownloading(false);
          this.notifyCompleted();
        }
      }
    });

    try {
      await invoke('start_downloads', {
        beatmapSetIds: pending.map(i => i.beatmapSetId),
        osuSession,
      });
    } catch (e) {
      this.error.set(typeof e === 'string' ? e : 'Download failed');
      for (const item of pending) {
        const q = this.beatmapStore.queue().find(q => q.beatmapSetId === item.beatmapSetId);
        if (q?.status === 'pending') {
          this.beatmapStore.updateStatus(item.beatmapSetId, 'failed');
        }
      }
    } finally {
      this.beatmapStore.setDownloading(false);
      this.unlisten?.();
      this.unlisten = undefined;
    }
  }

  private async appendFailedToFile(beatmapSetId: number) {
    const osuPath = this.osuPath.path();
    if (!osuPath) return;
    await invoke('append_text_file', {
      path: `${osuPath}/failed_downloads.txt`,
      content: `https://osu.ppy.sh/beatmapsets/${beatmapSetId}\n`,
    });
  }

  private notifyCompleted() {
    const failed = this.beatmapStore.queue().filter(i => i.status === 'failed');
    if (failed.length > 0) {
      sendNotification({
        title: 'Downloads completed',
        body: `${failed.length} maps failed. Saved to failed_downloads.txt`,
      });
    }
  }

  pause() {
    this.beatmapStore.setDownloading(false);
  }

  ngOnDestroy() {
    this.unlisten?.();
  }
}
