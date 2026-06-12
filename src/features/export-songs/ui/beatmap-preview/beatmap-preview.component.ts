import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BeatmapExporterStore } from '@features/export-songs/stores/beatmap-exporter.store'; 

@Component({
  selector: 'app-beatmap-preview',
  imports: [DecimalPipe],
  templateUrl: './beatmap-preview.component.html',
  styleUrl: './beatmap-preview.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BeatmapPreviewComponent {
  readonly store = inject(BeatmapExporterStore)
}
