import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BeatmapImportComponent, BeatmapQueueComponent } from "@features/beatmap-search";

@Component({
  selector: 'app-downloader',
  imports: [BeatmapImportComponent, BeatmapQueueComponent],
  templateUrl: './downloader.component.html',
  styleUrl: './downloader.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloaderComponent {}
