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
    const sets = this.store.filteredBeatmaps();

    const lines = sets.map(s =>
        this.format() === 'ids'
            ? `${s.beatmapsetId}`
            : `https://osu.ppy.sh/beatmapsets/${s.beatmapsetId}`
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
