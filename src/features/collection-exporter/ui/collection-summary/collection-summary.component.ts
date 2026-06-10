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
  readonly collectionStore = inject(CollectionStore);

  readonly selectedCount = computed(() =>
  this.collectionStore.selectedCollections().length);

  readonly totalBeatmaps = computed(() => {
    const selected = this.collectionStore.selectedCollections();
    return this.collectionStore.collections()
    .filter(c => selected.includes(c.name))
    .reduce((sum, c) => sum + c.beatmaps.length, 0);
  });
}
