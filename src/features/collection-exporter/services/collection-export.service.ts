import { inject, Injectable } from '@angular/core';
import { CollectionStore } from '@entities/collection';
import { BeatmapsetExportService } from '@shared/services';

@Injectable({ providedIn: 'root' })
export class CollectionExportService {
  private store = inject(CollectionStore);
  private exportService = inject(BeatmapsetExportService);

  exportToTxt(format: 'urls' | 'ids' | 'with-headers'): string {
    const selected = this.store.selectedCollections();
    const collections = this.store.collectionsWithBeatmaps()
      .filter(c => selected.includes(c.name));

    const lines: string[] = [];
    for (const col of collections) {
      if (format === 'with-headers') {
        lines.push(`----------------- ${col.name} -----------------`);
      }
      for (const set of col.sets) {
        lines.push(this.exportService.formatLine(
          set.beatmapsetId,
          format === 'with-headers' ? 'urls' : format
        ));
      }
      if (format === 'with-headers') lines.push('');
    }
    return lines.join('\n');
  }

  async exportToFile(format: 'urls' | 'ids' | 'with-headers') {
    const saved = await this.exportService.saveToFile(
      this.exportToTxt(format),
      'collections.txt'
    );
    if (saved) this.store.clearSelection();
  }
}
