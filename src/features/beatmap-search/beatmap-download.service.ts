import { inject, Injectable } from '@angular/core';
import { BeatmapStore, DownloadItem } from '@entities/beatmap';
import { UserStore } from '@entities/user';
import { OsuPathService } from '@shared/services';
import { invoke } from '@tauri-apps/api/core';

@Injectable({
  providedIn: 'root',
})
export class BeatmapDownloadService {
  private beatmapStore = inject(BeatmapStore);
  private userStore = inject(UserStore);
  private osuPath = inject(OsuPathService);

  async startDownload() {
    if (this.beatmapStore.isDownloading()) return;

    this.beatmapStore.setDownloading(true);

    const queue = this.beatmapStore.queue();
    const pending = queue.filter(i => i.status === 'pending' || i.status === 'failed');

    for (const item of pending) {
      await this.downloadOne(item);
    }

    this.beatmapStore.setDownloading(false);
  }

  private async downloadOne(item: DownloadItem) {
    this.beatmapStore.updateStatus(item.beatmapSetId, 'downloading', 0);

    const osuPath = this.osuPath.path();
    if (!osuPath) {
      this.beatmapStore.updateStatus(item.beatmapSetId, 'failed');
      return;
    }

    const songsFolder = `${osuPath}/Songs`;
    const user = this.userStore.user();

    // Try official osu! first when logged in
    if (user?.token) {
      try {
        await invoke('download_beatmap', {
          beatmapsetId: item.beatmapSetId,
          token: user.token,
          osuSession: user.osuSession ?? null,
          songsFolder,
        });
        this.beatmapStore.updateStatus(item.beatmapSetId, 'done', 100);
        return;
      } catch (error) {
        console.warn(`osu! download failed for ${item.beatmapSetId}, falling back to BeatConnect:`, error);
      }
    }

    // Fall back to BeatConnect
    try {
      await invoke('download_beatmap_beatconnect', { beatmapsetId: item.beatmapSetId, songsFolder });
      this.beatmapStore.updateStatus(item.beatmapSetId, 'done', 100);
    } catch (error) {
      console.error(`BeatConnect download failed for ${item.beatmapSetId}:`, error);
      this.beatmapStore.updateStatus(item.beatmapSetId, 'failed');
    }
  }

  pause() {
    this.beatmapStore.setDownloading(false);
  }
}