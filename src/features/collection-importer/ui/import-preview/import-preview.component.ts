import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ImportCollectionStore } from '@features/collection-importer';
import { BeatmapSetListComponent } from '@shared/ui';

@Component({
  selector: 'app-import-preview',
  imports: [AsyncPipe, BeatmapSetListComponent],
  template: `
    <div class="preview-panel">
      <div class="panel-header">
        <span class="section-title">Preview</span>
        @if (store.previewSets().length > 0) {
          <span class="map-count">{{ store.previewSets().length }} beatmapsets</span>
        }
      </div>
      <app-beatmap-set-list
        [sets]="(previewSets$ | async) ?? []"
        emptyText="Upload a .txt file to preview beatmaps to import"
      />
    </div>
  `,
  styleUrl: './import-preview.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportPreviewComponent {
  readonly store = inject(ImportCollectionStore);
  readonly previewSets$ = toObservable(this.store.previewSets);
}
