import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CollectionStore } from '@entities/collection';
import { CollectionExportService } from '@features/collection-exporter/services/collection-export.service';

@Component({
  selector: 'app-collection-export-controls',
  imports: [],
  templateUrl: './collection-export-controls.component.html',
  styleUrl: './collection-export-controls.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionExportControlsComponent {
  readonly exportService = inject(CollectionExportService);
  readonly store = inject(CollectionStore);

  readonly format = signal<'urls' | 'ids' | 'with-headers'>('urls');

  async export() {
    await this.exportService.exportToFile(this.format());
  }
}
