import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BeatmapImportComponent, BeatmapQueueComponent } from "@features/beatmap-search";
import { OsuCookieInput } from '@features/downloader';
import { UserStore } from '@entities/user';

@Component({
  selector: 'app-downloader',
  imports: [BeatmapImportComponent, BeatmapQueueComponent, OsuCookieInput],
  templateUrl: './downloader.component.html',
  styleUrl: './downloader.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloaderComponent {
  readonly userStore = inject(UserStore);
}
