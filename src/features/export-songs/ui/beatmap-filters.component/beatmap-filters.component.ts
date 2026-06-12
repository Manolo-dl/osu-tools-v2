import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { BeatmapFilter } from '@features/export-songs'

@Component({
  selector: 'app-beatmap-filters',
  imports: [],
  templateUrl: './beatmap-filters.component.html',
  styleUrl: './beatmap-filters.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BeatmapFiltersComponent {

  readonly filtersChange = output<BeatmapFilter>();

  readonly mode = signal<number | null>(null);
  readonly minStars = signal<number | null>(null);
  readonly maxStars = signal<number | null>(null)
  readonly status = signal<string | null>(null);

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
    this.mode.set(value);
    this.emit();
  }

  setStatus(value: string | null) {
    this.status.set(value);
    this.emit();
  }

  setMinStars(value: string) {
    this.minStars.set(value ? parseFloat(value) : null);
    this.emit();
  }

  setMaxStars(value: string) {
    this.maxStars.set(value ? parseFloat(value) : null);
    this.emit();
  }

  private emit() {
    this.filtersChange.emit({
      mode: this.mode() ?? undefined,
      minStars: this.minStars() ?? undefined,
      maxStars: this.maxStars() ?? undefined,
      status: this.status() ?? undefined,
    })
  }
}
