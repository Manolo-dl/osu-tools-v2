import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BeatmapExporterStore } from '@features/export-songs/stores/beatmap-exporter.store';

@Component({
  selector: 'app-beatmap-filters',
  imports: [],
  templateUrl: './beatmap-filters.component.html',
  styleUrl: './beatmap-filters.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BeatmapFiltersComponent {

  readonly store = inject(BeatmapExporterStore);

  readonly modes = [
    { label: 'Standard', value: 0 },
    { label: 'Taiko', value: 1 },
    { label: 'Catch', value: 2 },
    { label: 'Mania', value: 3 }
  ];

  readonly statuses = [
    { label: 'Ranked', value: 'ranked' },
    { label: 'Loved', value: 'loved' },
    { label: 'Approved', value: 'approved' },
    { label: 'Qualified', value: 'qualified' },
    { label: 'Unranked', value: 'unranked' },
  ];

  setMode(value: number | null) {
    this.store.setFilters({ mode: value });
  }

  setStatus(value: string | null) {
    this.store.setFilters({ status: value });
  }

  setMinStars(value: string) {
    this.store.setFilters({ minStars: value ? parseFloat(value) : null });
  }

  setMaxStars(value: string) {
    this.store.setFilters({ maxStars: value ? parseFloat(value) : null });
  }

  setMinBpm(value: string) {
    this.store.setFilters({ minBpm: value ? parseFloat(value) : null });
  }

  setMaxBpm(value: string) {
    this.store.setFilters({ maxBpm: value ? parseFloat(value) : null });
  }

  setMinLength(value: string) {
    this.store.setFilters({ minLength: value ? parseInt(value) * 1000 : null });
  }

  setMaxLength(value: string) {
    this.store.setFilters({ maxLength: value ? parseInt(value) * 1000 : null });
  }

  setLastPlayed(value: boolean | null) {
    this.store.setFilters({ lastPlayed: value });
  }

  reset() {
    this.store.resetFilters();
  }
}
