import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CollectionStore } from '@entities/collection';

@Component({
  selector: 'app-collection-summary',
  imports: [],
  templateUrl: './collection-summary.component.html',
  styleUrl: './collection-summary.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionSummaryComponent {
  readonly store = inject(CollectionStore);

  readonly selectedCount = computed(() => this.store.selectedCollections().length);

  readonly totalSets = computed(() => {
    const selected = this.store.selectedCollections();
    const seen = new Set<number>();
    for (const col of this.store.collectionsWithBeatmaps()) {
      if (!selected.includes(col.name)) continue;
      for (const set of col.sets) seen.add(set.beatmapsetId);
    }
    return seen.size;
  });
}
