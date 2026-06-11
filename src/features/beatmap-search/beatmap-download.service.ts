import { inject, Injectable } from '@angular/core';
import { BeatmapStore, DownloadItem } from '@entities/beatmap';
import { UserStore } from '@entities/user';
import { OsuPathService } from '@shared/services';
import { fetch } from '@tauri-apps/plugin-http';
import { invoke } from '@tauri-apps/api/core';
import { sendNotification } from '@tauri-apps/plugin-notification';

@Injectable({
  providedIn: 'root',
})
export class BeatmapDownloadService {
  private osuPath = inject(OsuPathService);
  private beatmapStore = inject(BeatmapStore);
  private userStore = inject(UserStore);

  async startDownload() {
    if (this.beatmapStore.isDownloading()) return;

    this.beatmapStore.setDownloading(true);

    const pending = this.beatmapStore.queue()
      .filter(i => i.status === 'pending');

    for (const item of pending) {
      await this.downloadOne(item);
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    this.beatmapStore.setDownloading(false);
    await this.exportFailed();
  }

  private async exportFailed() {
    const failed = this.beatmapStore.queue()
      .filter(i => i.status === 'failed');

    if (failed.length === 0) return;

    const osuPath = this.osuPath.path();
    if (!osuPath) return;

    const content = failed
      .map(i => `https://osu.ppy.sh/beatmapsets/${i.beatmapSetId}`)
      .join('\n');

    const filename = 'failed_downloads.txt';
    const path = `${osuPath}/${filename}`;

    await invoke('write_text_file', { path, content });

    await sendNotification({
      title: 'Downloads completed',
      body: `${failed.length} maps failed. Saved to ${filename}`,
    });
  }

  private async downloadOne(item: DownloadItem) {
    this.beatmapStore.updateStatus(item.beatmapSetId, 'downloading', 0);

    const osuPath = this.osuPath.path();
    if (!osuPath) {
      this.beatmapStore.updateStatus(item.beatmapSetId, 'failed');
      return;
    }

    const songsFolder = `${osuPath}/Songs`;
    const osuSession = this.userStore.user()?.osuSession;

    if (osuSession) {
      try {
        await this.downloadFromOsu(item.beatmapSetId, osuSession, songsFolder);
        this.beatmapStore.updateStatus(item.beatmapSetId, 'done', 100);
        return;
      } catch (error) {
        console.log(`Failed to download beatmap set ${item.beatmapSetId}:`, error);
        this.beatmapStore.updateStatus(item.beatmapSetId, 'failed');
      }
    }
  }

  private async downloadFromOsu(beatmapSetId: number, osuSession: string, songsFolder: string) {
    const response = await fetch(`https://osu.ppy.sh/beatmapsets/${beatmapSetId}/download`, {
      method: 'GET',
      headers: {
        'Cookie': `osu_session=${osuSession}`,
        'Referer': `https://osu.ppy.sh/beatmapsets/${beatmapSetId}`,
      },
      redirect: 'follow',
    });

    if (!response.ok) throw new Error(`Failed to download beatmap set ${beatmapSetId}: ${response.statusText}`);

    const bytes = new Uint8Array(await response.arrayBuffer());

    const MAX_SIZE = 200 * 1024 * 1024;
    if (bytes.length > MAX_SIZE) throw new Error(`Beatmap set ${beatmapSetId} is too large`);

    const disposition = response.headers.get('Content-Disposition') ?? '';
    const filenameMatch = disposition.match(/filename="?([^";\n]+)"?/);
    const filename = filenameMatch
      ? filenameMatch[1].replace(/[/\\\0]/g, '_')
      : `${beatmapSetId}.osz`;

    await this.saveFile(songsFolder, filename, bytes);
  }

  private async saveFile(songsFolder: string, filename: string, bytes: Uint8Array) {
    await invoke('write_beatmap_file', { path: `${songsFolder}/${filename}`, bytes: Array.from(bytes) });
  }

  pause() {
    this.beatmapStore.setDownloading(false);
  }
}