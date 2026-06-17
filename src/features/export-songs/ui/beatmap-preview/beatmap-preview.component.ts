import { DecimalPipe, NgClass, SlicePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BeatmapExporterStore } from '@features/export-songs/stores/beatmap-exporter.store';

@Component({
  selector: 'app-beatmap-preview',
  imports: [DecimalPipe, NgClass, SlicePipe],
  templateUrl: './beatmap-preview.component.html',
  styleUrl: './beatmap-preview.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BeatmapPreviewComponent {
  readonly store = inject(BeatmapExporterStore);

  diffColor(stars: number): string {
    if (stars < 2) return '#8b9df0';
    if (stars < 3) return '#66cc66';
    if (stars < 4.5) return '#ffd966';
    if (stars < 6) return '#ff8c69';
    if (stars < 7) return '#e05555';
    return '#c966ff';
  }

  modeName(mode: number): string {
    return ['Standard', 'Taiko', 'Catch', 'Mania'][mode] ?? 'Unknown';
  }
}
