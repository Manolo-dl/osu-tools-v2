import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BeatmapImportComponent, BeatmapQueueComponent } from "@features/beatmap-search";
import { OsuCookieInputComponent } from '@features/downloader';
import { OsuDbStore } from '@entities/osu-db';

@Component({
  selector: 'app-downloader',
  imports: [BeatmapImportComponent, BeatmapQueueComponent, OsuCookieInputComponent],
  templateUrl: './downloader-page.component.html',
  styleUrl: './downloader-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloaderPageComponent {
  readonly osuDb = inject(OsuDbStore);

  async loadLibrary() {
    await this.osuDb.load();
  }
}
