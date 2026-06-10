import { inject, Injectable } from '@angular/core';
import { CollectionStore, CollectionWithBeatmaps } from '@entities/collection';
import { OsuPathService } from '@shared/services';
import { invoke } from '@tauri-apps/api/core';
import { save } from '@tauri-apps/plugin-dialog';
import { writeTextFile } from '@tauri-apps/plugin-fs';

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
  private osuPath = inject(OsuPathService);

  async loadCollections() {
    const osuPath = this.osuPath.path();
    console.log('Osu! path:', osuPath);
    if (!osuPath) throw new Error("Osu! path not set");

    this.collectionStore.setLoading(true);

    try {
      const [collections, beatmaps] = await Promise.all([
        invoke<RustCollection[]>('read_osu_collections', { osuPath }),
        invoke<RustBeatmap[]>('read_osu_db', { osuPath }),
      ]);

      console.log('Collections:', collections.length);
      console.log('Beatmaps:', beatmaps.length);
      console.log('First beatmap:', beatmaps[0]);

      const beatmapByMd5 = new Map(
        beatmaps.map(b => [b.md5, b])
      );

      const result: CollectionWithBeatmaps[] = collections.map(col => ({
        name: col.name,
        beatmaps: col.md5s
          .map(md5 => {
            const beatmap = beatmapByMd5.get(md5);
            if (!beatmap) return null;

            console.log('keys:', Object.keys(beatmap));
            console.log('beatmapset_id value:', beatmap['beatmapset_id']);

            return {
              md5,
              beatmapSetId: beatmap['beatmapset_id'],
              title: beatmap.title,
              artist: beatmap.artist,
            };
          })
          .filter((b): b is NonNullable<typeof b> => b !== null)
      }));

      this.collectionStore.setCollections(result);
    } catch (error) {
      this.collectionStore.setLoading(false);
      throw error;
    }
  }

  exportToTxt(format: 'urls' | 'ids' | 'with-headers'): string {
    const selected = this.collectionStore.selectedCollections();
    const collections = this.collectionStore.collections()
      .filter(c => selected.includes(c.name));

    const lines: string[] = [];

    for (const collection of collections) {
      if (format === 'with-headers') {
        lines.push(`----------------- ${collection.name}-----------------`);
      }

      for (const beatmap of collection.beatmaps) {
        if (format === 'ids') {
          lines.push(`${beatmap.beatmapSetId}`);
        } else {
          lines.push(`https://osu.ppy.sh/beatmapsets/${beatmap.beatmapSetId}`);
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
      await writeTextFile(path, content);
    }
  }
}
