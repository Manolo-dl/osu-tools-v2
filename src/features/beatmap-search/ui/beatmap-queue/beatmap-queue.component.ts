import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BeatmapStore } from '@entities/beatmap';
import { BeatmapDownloadService } from '@features/beatmap-search';

@Component({
  selector: 'app-beatmap-queue',
  imports: [],
  templateUrl: './beatmap-queue.component.html',
  styleUrl: './beatmap-queue.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BeatmapQueueComponent {
  readonly beatmapStore = inject(BeatmapStore);
  private downloader = inject(BeatmapDownloadService);

  get pending() {
    return this.beatmapStore.queue().filter(i => i.status === 'pending').length;
  }

  get done() {
    return this.beatmapStore.queue().filter(i => i.status === 'done').length;
  }

  get failed() {
    return this.beatmapStore.queue().filter(i => i.status === 'failed').length;
  }

  startDownload() {
    this.downloader.startDownload();
  }

  pause() {
    this.downloader.pause();
  }

  clearQueue() {
    this.beatmapStore.clearQueue();
  }
}
