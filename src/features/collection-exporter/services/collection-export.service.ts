import { inject, Injectable } from '@angular/core';
import { CollectionStore } from '@entities/collection';
import { OsuDbStore } from '@entities/osu-db';
import { invoke } from '@tauri-apps/api/core';
import { save } from '@tauri-apps/plugin-dialog';

interface RustCollection {
  name: string;
  md5s: string[];
}

interface RustBeatmap {
  md5: string;
  beatmapset_id: number;
  title: string;
  artist: string;
}

@Injectable({
  providedIn: 'root',
})
export class CollectionExportService {

  private collectionStore = inject(CollectionStore);
  private osuDbStore = inject(OsuDbStore);

  exportToTxt(format: 'urls' | 'ids' | 'with-headers'): string {
    const selected = this.collectionStore.selectedCollections();
    const collections = this.collectionStore.collectionsWithBeatmaps()
      .filter(c => selected.includes(c.name));

    const lines: string[] = [];

    for (const collection of collections) {
      if (format === 'with-headers') {
        lines.push(`----------------- ${collection.name}-----------------`);
      }

      for (const beatmap of collection.beatmaps) {

        const setId = this.osuDbStore.beatmapSetIdByMd5().get(beatmap.md5);
        if (!setId) continue;

        if (format === 'ids') {
          lines.push(`${setId}`);
        } else {
          lines.push(`https://osu.ppy.sh/beatmapsets/${setId}`);
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
