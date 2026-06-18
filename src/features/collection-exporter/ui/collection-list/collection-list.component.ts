import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CollectionStore } from '@entities/collection';

@Component({
  selector: 'app-collection-list',
  imports: [],
  templateUrl: './collection-list.component.html',
  styleUrl: './collection-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionListComponent {
  readonly store = inject(CollectionStore);

  readonly allSelected = computed(() => {
    const cols = this.store.collectionsWithBeatmaps();
    const selected = this.store.selectedCollections();
    return cols.length > 0 && cols.length === selected.length;
  });

  isSelected(name: string): boolean {
    return this.store.selectedCollections().includes(name);
  }

  toggleAll() {
    if (this.allSelected()) {
      this.store.clearSelection();
    } else {
      this.store.selectAll();
    }
  }
}
