import { inject, Injectable } from '@angular/core';
import { CollectionStore } from '@entities/collection';
import { OsuDbStore } from '@entities/osu-db';
import { BeatmapsetExportService } from '@shared/services';

@Injectable({ providedIn: 'root' })
export class CollectionExportService {
  private store = inject(CollectionStore);
  private osuDb = inject(OsuDbStore);
  private exportService = inject(BeatmapsetExportService);

  exportToTxt(format: 'urls' | 'import'): string {
    const selected = this.store.selectedCollections();

    if (format === 'urls') {
      const sets = this.store.selectedSets();
      return sets
        .map(s => `https://osu.ppy.sh/beatmapsets/${s.beatmapsetId}`)
        .join('\n');
    }

    const knownMd5s = this.osuDb.beatmapSetsByMd5();
    const collections = this.store.collections()
      .filter(c => selected.includes(c.name));

    const sections: string[] = [];
    for (const col of collections) {
      const md5s = col.md5s.filter(md5 => knownMd5s.has(md5));
      if (md5s.length === 0) continue;
      sections.push([`- ${col.name}`, ...md5s].join('\n'));
    }
    return sections.join('\n\n');
  }

  async exportToFile(format: 'urls' | 'import') {
    const saved = await this.exportService.saveToFile(
      this.exportToTxt(format),
      'collections.txt'
    );
    if (saved) this.store.clearSelection();
  }
}
