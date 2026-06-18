import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BeatmapImportComponent, BeatmapQueueComponent } from "@features/beatmap-search";
import { OsuCookieInput } from '@features/downloader';
import { UserStore } from '@entities/user';
import { OsuDbStore } from '@entities/osu-db';

@Component({
  selector: 'app-downloader',
  imports: [BeatmapImportComponent, BeatmapQueueComponent, OsuCookieInput],
  templateUrl: './downloader.component.html',
  styleUrl: './downloader.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloaderComponent {
  readonly userStore = inject(UserStore);
  readonly osuDb = inject(OsuDbStore);

  async loadLibrary() {
    await this.osuDb.load();
  }
}
