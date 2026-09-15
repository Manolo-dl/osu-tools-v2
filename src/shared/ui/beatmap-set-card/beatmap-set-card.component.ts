import { DecimalPipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, computed, signal } from '@angular/core';
import { OsuBeatmapSet, OsuDiff } from '@entities/osu-db/osu-db.model';
import { openUrl } from '@tauri-apps/plugin-opener';

@Component({
  selector: 'app-beatmap-set-card',
  imports: [DecimalPipe, NgClass],
  templateUrl: './beatmap-set-card.component.html',
  styleUrl: './beatmap-set-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BeatmapSetCardComponent {
  @Input({ required: true }) set!: OsuBeatmapSet;

  readonly expanded = signal(false);

  get hasExportableDiff(): boolean {
    return this.set.diffs.some(d => d.status !== 'unsubmitted' && d.status !== 'unknown');
  }

  toggleExpand(event: Event) {
    event.stopPropagation();
    this.expanded.update(v => !v);
  }

  openSet(event: Event) {
    event.stopPropagation();
    if (!this.hasExportableDiff) return;
    openUrl(`https://osu.ppy.sh/beatmapsets/${this.set.beatmapsetId}`);
  }

  sortedDiffs(diffs: OsuDiff[]): OsuDiff[] {
    return [...diffs].sort((a, b) => a.mode !== b.mode ? a.mode - b.mode : a.stars - b.stars);
  }

  uniqueModes(diffs: OsuDiff[]): number[] {
    return [...new Set(diffs.map(d => d.mode))].sort();
  }

  visibleDiffsForMode(diffs: OsuDiff[], mode: number): OsuDiff[] {
    return diffs.filter(d => d.mode === mode).sort((a, b) => a.stars - b.stars).slice(0, 6);
  }

  extraDiffsForMode(diffs: OsuDiff[], mode: number): number {
    return Math.max(0, diffs.filter(d => d.mode === mode).length - 6);
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

  setStatus(): string {
  const priority = ['ranked', 'approved', 'qualified', 'loved', 'unranked', 'unsubmitted', 'unknown'];
  const statuses = new Set(this.set.diffs.map(d => d.status));
  for (const p of priority) {
    if (statuses.has(p)) return p;
  }
  return 'unknown';
}
}
