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
  readonly exportService = inject(CollectionExportService);
  readonly store = inject(CollectionStore);

  readonly format = signal<'urls' | 'ids' | 'with-headers'>('urls');

  readonly totalSets = computed(() => {
    const selected = this.store.selectedCollections();
    const seen = new Set<number>();
    for (const col of this.store.collectionsWithBeatmaps()) {
      if (!selected.includes(col.name)) continue;
      for (const set of col.sets) seen.add(set.beatmapsetId);
    }
    return seen.size;
  });

  setFormat(format: 'urls' | 'ids' | 'with-headers') {
    this.format.set(format);
  }

  async export() {
    await this.exportService.exportToFile(this.format());
  }
}
