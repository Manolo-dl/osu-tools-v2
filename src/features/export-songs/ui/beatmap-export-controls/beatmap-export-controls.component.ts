import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { OsuDbStore } from '@entities/osu-db';
import { BeatmapExporterStore } from '@features/export-songs/stores/beatmap-exporter.store';
import { invoke } from '@tauri-apps/api/core';
import { save } from '@tauri-apps/plugin-dialog';

@Component({
  selector: 'app-beatmap-export-controls',
  imports: [],
  templateUrl: './beatmap-export-controls.component.html',
  styleUrl: './beatmap-export-controls.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BeatmapExportControlsComponent {

  readonly store = inject(BeatmapExporterStore);
  readonly osuDb = inject(OsuDbStore);

  readonly format = signal<'urls' | 'ids'>('urls');

  setFormat(format: 'urls' | 'ids') {
    this.format.set(format);
  }

  async export() {
    const beatmaps = this.store.filteredBeatmaps();

    const lines = beatmaps.map(b =>
      this.format() === 'ids'
        ? `${b.beatmapset_id}`
        : `https://osu.ppy.sh/beatmapsets/${b.beatmapset_id}`
    );

    const content = lines.join('\n');

    const path = await save({
      filters: [{ name: 'Text', extensions: ['txt'] }],
      defaultPath: 'beatmaps.txt',
    });

    if (path) {
      await invoke('write_text_file', { path, content });
    }
  }
}
