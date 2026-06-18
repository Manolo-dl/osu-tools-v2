import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CollectionStore } from '@entities/collection';
import type { OsuBeatmapSet } from '@entities/osu-db/osu-db-model';
import { BeatmapSetListComponent } from '@shared/ui';

@Component({
  selector: 'app-collection-preview',
  imports: [BeatmapSetListComponent],
  templateUrl: './collection-preview.component.html',
  styleUrl: './collection-preview.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionPreviewComponent {
  readonly store = inject(CollectionStore);

  readonly previewSets = computed<OsuBeatmapSet[]>(() => {
    const selected = this.store.selectedCollections();
    const seen = new Set<number>();
    const sets: OsuBeatmapSet[] = [];

    for (const col of this.store.collectionsWithBeatmaps()) {
      if (!selected.includes(col.name)) continue;
      for (const set of col.sets) {
        if (seen.has(set.beatmapsetId)) continue;
        seen.add(set.beatmapsetId);
        sets.push(set);
      }
    }
    return sets;
  });
}
