import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CollectionStore } from '@entities/collection';
import { openUrl } from '@tauri-apps/plugin-opener';

@Component({
  selector: 'app-collection-preview',
  imports: [],
  templateUrl: './collection-preview.component.html',
  styleUrl: './collection-preview.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionPreviewComponent {

  readonly collectionStore = inject(CollectionStore);

  readonly previewItems = computed(() => {
    const selected = this.collectionStore.selectedCollections();
    const result = this.collectionStore.collections()
      .filter(c => selected.includes(c.name))
      .flatMap(c =>
        c.beatmaps.map(b => ({
          collectionName: c.name,
          title: b.title,
          beatmapsetId: b.beatmapSetId,
        }))
      );
    console.log('first item:', result[0]);
    return result;
  });

  async openMap(beatmapsetId: number) {
    await openUrl(`https://osu.ppy.sh/beatmapsets/${beatmapsetId}`);
  }
}
