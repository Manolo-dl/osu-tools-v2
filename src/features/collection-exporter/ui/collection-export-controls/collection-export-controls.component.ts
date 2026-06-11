import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CollectionStore } from '@entities/collection';
import { CollectionExportService } from '@features/collection-exporter/services/collection-export.service';

@Component({
  selector: 'app-collection-export-controls',
  imports: [],
  templateUrl: './collection-export-controls.component.html',
  styleUrl: './collection-export-controls.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionExportControlsComponent {
  readonly exportService = inject(CollectionExportService)
  readonly collectionStore = inject(CollectionStore);

  readonly format = signal<'urls' | 'ids' | 'with-headers'>('urls');

  readonly totalBeatmaps = computed(() => {
    const selected = this.collectionStore.selectedCollections();
    return this.collectionStore.collections()
      .filter(c => selected.includes(c.name))
      .reduce((sum, c) => sum + c.beatmaps.length, 0);
  });

  setFormat(format: 'urls' | 'ids' | 'with-headers') {
    this.format.set(format);
  }

  async export() {
    await this.exportService.exportToFile(this.format());
  }
}
