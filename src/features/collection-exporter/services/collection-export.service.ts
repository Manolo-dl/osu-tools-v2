import { inject, Injectable } from '@angular/core';
import { CollectionStore } from '@entities/collection';
import { invoke } from '@tauri-apps/api/core';
import { save } from '@tauri-apps/plugin-dialog';

@Injectable({
  providedIn: 'root',
})
export class CollectionExportService {
  private store = inject(CollectionStore);

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
        lines.push(format === 'ids'
          ? `${set.beatmapsetId}`
          : `https://osu.ppy.sh/beatmapsets/${set.beatmapsetId}`
        );
      }
      if (format === 'with-headers') lines.push('');
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
      this.store.clearSelection();
    }
  }
}
