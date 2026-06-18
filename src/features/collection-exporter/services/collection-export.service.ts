import { inject, Injectable } from '@angular/core';
import { CollectionStore } from '@entities/collection';
import { invoke } from '@tauri-apps/api/core';
import { save } from '@tauri-apps/plugin-dialog';

@Injectable({
  providedIn: 'root',
})
export class CollectionExportService {
  private collectionStore = inject(CollectionStore);

  exportToTxt(format: 'urls' | 'ids' | 'with-headers'): string {
    const selected = this.collectionStore.selectedCollections();
    const collections = this.collectionStore.collectionsWithBeatmaps()
      .filter(c => selected.includes(c.name));

    const lines: string[] = [];

    for (const collection of collections) {
      if (format === 'with-headers') {
        lines.push(`----------------- ${collection.name} -----------------`);
      }

      for (const set of collection.sets) {
        if (format === 'ids') {
          lines.push(`${set.beatmapsetId}`);
        } else {
          lines.push(`https://osu.ppy.sh/beatmapsets/${set.beatmapsetId}`);
        }
      }

      if (format === 'with-headers') {
        lines.push('');
      }
    }

    return lines.join('\n');
  }

  async exportToFile(format: 'urls' | 'ids' | 'with-headers') {
    const content = this.exportToTxt(format);

    const path = await save({
      filters: [{ name: 'Text', extensions: ['txt'] }],
      defaultPath: 'collections.txt',
    });

    if (path) {
      await invoke('write_text_file', { path, content });
      this.collectionStore.clearSelection();
    }
  }
}
