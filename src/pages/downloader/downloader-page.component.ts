import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BeatmapImportComponent, BeatmapQueueComponent } from "@features/beatmap-search";
import { OsuCookieInputComponent } from '@features/downloader';
import { OsuDbStore } from '@entities/osu-db';
import { TuiTitle, TuiNotificationDirective, TuiButton } from "@taiga-ui/core";

@Component({
  selector: 'app-downloader',
  imports: [BeatmapImportComponent, BeatmapQueueComponent, OsuCookieInputComponent, TuiTitle, TuiNotificationDirective, TuiButton],
  templateUrl: './downloader-page.component.html',
  styleUrl: './downloader-page.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloaderPageComponent {
  readonly osuDb = inject(OsuDbStore);

  async loadLibrary() {
    await this.osuDb.load();
  }
}
