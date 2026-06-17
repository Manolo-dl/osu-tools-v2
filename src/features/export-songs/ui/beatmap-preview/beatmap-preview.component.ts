import { AsyncPipe, DecimalPipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { BeatmapExporterStore } from '@features/export-songs/stores/beatmap-exporter.store';
import { OsuDiff, OsuBeatmapSet } from '@entities/osu-db/osu-db-model';
import { openUrl } from '@tauri-apps/plugin-opener';

@Component({
  selector: 'app-beatmap-preview',
  imports: [DecimalPipe, NgClass, AsyncPipe, ScrollingModule],
  templateUrl: './beatmap-preview.component.html',
  styleUrl: './beatmap-preview.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BeatmapPreviewComponent {
  readonly store = inject(BeatmapExporterStore);

  readonly filteredBeatmaps$ = toObservable(this.store.filteredBeatmaps);

  private expandedId = signal<number | null>(null);

  toggleExpand(id: number, event: Event) {
    event.stopPropagation();
    this.expandedId.update(current => current === id ? null : id);
  }

  isExpanded(id: number): boolean {
    return this.expandedId() === id;
  }

  trackSet(_: number, set: OsuBeatmapSet): number {
    return set.beatmapsetId;
  }

  sortedDiffs(diffs: OsuDiff[]): OsuDiff[] {
    return [...diffs].sort((a, b) =>
      a.mode !== b.mode ? a.mode - b.mode : a.stars - b.stars
    );
  }

  uniqueModes(diffs: OsuDiff[]): number[] {
    return [...new Set(diffs.map(d => d.mode))].sort();
  }

  diffBg(stars: number): string {
    if (stars < 2)   return '#8bc9ff';
    if (stars < 2.5) return '#89e066';
    if (stars < 3.5) return '#f7eb40';
    if (stars < 4.5) return '#f9a12e';
    if (stars < 5.5) return '#f9504b';
    if (stars < 6.5) return '#e06fda';
    if (stars < 8)   return '#be4bf5';
    return '#6c30f5';
  }

  diffFg(stars: number): string {
    return stars >= 5 ? '#fff' : '#1a1a1a';
  }

  modeChar(mode: number): string {
    return ['●', '◉', '✿', '⊞'][mode] ?? '●';
  }

  modeColor(mode: number): string {
    return ['#ff66ab', '#e05555', '#66bbff', '#c966ff'][mode] ?? '#aaa';
  }

  openSet(beatmapsetId: number) {
    openUrl(`https://osu.ppy.sh/beatmapsets/${beatmapsetId}`);
  }
}
