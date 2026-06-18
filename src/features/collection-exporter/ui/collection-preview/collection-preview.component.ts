import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CollectionStore } from '@entities/collection';
import { OsuBeatmapSet, OsuDiff } from '@entities/osu-db/osu-db-model';
import { openUrl } from '@tauri-apps/plugin-opener';

@Component({
  selector: 'app-collection-preview',
  imports: [],
  templateUrl: './collection-preview.component.html',
  styleUrl: './collection-preview.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionPreviewComponent {
  readonly store = inject(CollectionStore);

  readonly previewItems = computed(() => {
    const selected = this.store.selectedCollections();
    const seen = new Set<number>();
    const items: { set: OsuBeatmapSet; collectionName: string }[] = [];

    for (const col of this.store.collectionsWithBeatmaps()) {
      if (!selected.includes(col.name)) continue;
      for (const set of col.sets) {
        if (seen.has(set.beatmapsetId)) continue;
        seen.add(set.beatmapsetId);
        items.push({ set, collectionName: col.name });
      }
    }
    return items;
  });

  readonly multipleSelected = computed(() => this.store.selectedCollections().length > 1);

  uniqueModes(diffs: OsuDiff[]): number[] {
    return [...new Set(diffs.map(d => d.mode))].sort();
  }

  visibleDiffs(diffs: OsuDiff[], mode: number): OsuDiff[] {
    return diffs.filter(d => d.mode === mode).sort((a, b) => a.stars - b.stars).slice(0, 5);
  }

  extraDiffs(diffs: OsuDiff[], mode: number): number {
    return Math.max(0, diffs.filter(d => d.mode === mode).length - 5);
  }

  modeChar(mode: number): string {
    return ['○', '◎', '◉', '⊞'][mode] ?? '?';
  }

  modeColor(mode: number): string {
    return ['#ff66aa', '#e05a00', '#8ac8f0', '#b36be0'][mode] ?? '#888';
  }

  diffBg(stars: number): string {
    if (stars < 2) return '#4fc3f7';
    if (stars < 3) return '#81c784';
    if (stars < 4) return '#ffb300';
    if (stars < 5) return '#ef5350';
    if (stars < 6) return '#ab47bc';
    return '#212121';
  }

  async openSet(beatmapsetId: number) {
    await openUrl(`https://osu.ppy.sh/beatmapsets/${beatmapsetId}`);
  }
}
