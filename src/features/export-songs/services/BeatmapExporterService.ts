import { inject, Injectable } from '@angular/core';
import { OsuPathService } from '@shared/services';
import { invoke } from '@tauri-apps/api/core';
import { save } from '@tauri-apps/plugin-dialog';

interface BeatmapFiltered {
  md5: string;
  beatmapset_id: number;
  title: string;
  artist: string;
  stars: number;
}

export interface BeatmapFilter {
  mode?: number;
  minStars?: number;
  maxStars?: number;
  status?: number;
}

@Injectable({
  providedIn: 'root',
})
export class BeatmapExporterService {

  private osuPath = inject(OsuPathService);

  async loadBeatmaps(filter: BeatmapFilter = {}): Promise<BeatmapFiltered[]> {

    const osuPath = this.osuPath.path();
    if (!osuPath) throw new Error('Osu! path is not set');

    return invoke<BeatmapFiltered[]>('read_osu_db_filtered', {
      osuPath,
      mode: filter.mode ?? null,
      minStars: filter.minStars ?? null,
      maxStars: filter.maxStars ?? null,
      status: filter.status ?? null,
    });
  }

  async exportToFile(beatmaps: BeatmapFiltered[], format: 'urls' | 'ids') {

    const lines = beatmaps.map(b =>
      format === 'ids'
        ? `${b.beatmapset_id}`
        : 'https://osu.ppy.sh/beatmapsets/${b.beatmapset_id}'
    );

    const content = lines.join('\n');

    const path = await save({
      filters: [{ name: 'Text', extensions: ['txt'] }],
    });

    if (path) {
      await invoke('write_text_file', { path, content });
    }
  }
}
