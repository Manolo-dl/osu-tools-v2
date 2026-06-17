import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BeatmapExporterStore, BeatmapFilters } from '@features/export-songs/stores/beatmap-exporter.store';

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
    { label: 'Mania', value: 3 },
  ];

  readonly statuses = ['Ranked', 'Loved', 'Approved', 'Qualified', 'Unranked'];

  setMode(value: number | null) {
    this.store.setFilters({ mode: value });
  }

  setStatus(value: string | null) {
    this.store.setFilters({ status: value ? value.toLowerCase() : null });
  }

  setMinStars(value: string) { this.setMin('minStars', 'maxStars', value); }
  setMaxStars(value: string) { this.setMax('minStars', 'maxStars', value); }

  setMinBpm(value: string) { this.setMin('minBpm', 'maxBpm', value); }
  setMaxBpm(value: string) { this.setMax('minBpm', 'maxBpm', value); }

  setMinLength(value: string) {
    const min = value ? parseInt(value) * 1000 : null;
    const currentMax = this.store.filters().maxLength;
    this.store.setFilters({
      minLength: min,
      ...(min !== null && (currentMax === null || min > currentMax) ? { maxLength: min } : {}),
    });
  }

  setMaxLength(value: string) {
    const max = value ? parseInt(value) * 1000 : null;
    const currentMin = this.store.filters().minLength;
    this.store.setFilters({
      maxLength: max,
      ...(max !== null && currentMin !== null && max < currentMin ? { minLength: max } : {}),
    });
  }

  setLastPlayed(value: boolean | null) {
    this.store.setFilters({ lastPlayed: value });
  }

  setMinAr(value: string) { this.setMin('minAr', 'maxAr', value); }
  setMaxAr(value: string) { this.setMax('minAr', 'maxAr', value); }

  setMinOd(value: string) { this.setMin('minOd', 'maxOd', value); }
  setMaxOd(value: string) { this.setMax('minOd', 'maxOd', value); }

  setMinHp(value: string) { this.setMin('minHp', 'maxHp', value); }
  setMaxHp(value: string) { this.setMax('minHp', 'maxHp', value); }

  setMinCircleSize(value: string) { this.setMin('minCircleSize', 'maxCircleSize', value); }
  setMaxCircleSize(value: string) { this.setMax('minCircleSize', 'maxCircleSize', value); }

  setKeyCount(value: number | null) {
    this.store.setFilters({ keyCount: value });
  }

  msToSec(ms: number | null): number | '' {
    return ms !== null ? ms / 1000 : '';
  }

  reset() {
    this.store.resetFilters();
  }

  private setMin(minKey: keyof BeatmapFilters, maxKey: keyof BeatmapFilters, value: string) {
    const min = value ? parseFloat(value) : null;
    const currentMax = this.store.filters()[maxKey] as number | null;
    // if max is unset or min exceeds it, pull max up to min
    this.store.setFilters({
      [minKey]: min,
      ...(min !== null && (currentMax === null || min > currentMax) ? { [maxKey]: min } : {}),
    } as Partial<BeatmapFilters>);
  }

  private setMax(minKey: keyof BeatmapFilters, maxKey: keyof BeatmapFilters, value: string) {
    const max = value ? parseFloat(value) : null;
    const currentMin = this.store.filters()[minKey] as number | null;
    // if max drops below min, pull min down to match
    this.store.setFilters({
      [maxKey]: max,
      ...(max !== null && currentMin !== null && max < currentMin ? { [minKey]: max } : {}),
    } as Partial<BeatmapFilters>);
  }
}
