import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CollectionStore } from '@entities/collection';
import { CollectionExportService } from '@features/collection-exporter/services/collection-export.service';

@Component({
  selector: 'app-collection-list',
  imports: [],
  templateUrl: './collection-list.component.html',
  styleUrl: './collection-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionListComponent {
  
  readonly collectionStore = inject(CollectionStore);
  readonly exporterService = inject(CollectionExportService);

  readonly allSelected = computed(() => {
    const collections = this.collectionStore.collections();
    const selected = this.collectionStore.selectedCollections();
    return collections.length > 0 && collections.length === selected.length;
  });

  isSelected(name: string) {
    return this.collectionStore.selectedCollections().includes(name);
  }

  toggleSelection(name: string) {
    this.collectionStore.toggleSelection(name);
  }

  toggleAll() { 
    if (this.allSelected()) {
      this.collectionStore.clearSelection();
    } else {
      this.collectionStore.selectAll();
    }
  }
}
