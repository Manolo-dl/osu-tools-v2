import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CollectionStore } from '@entities/collection';
import { CollectionExportService } from '@features/collection-exporter/services/collection-export.service';
import { ExportControlsComponent, ExportFormat } from '@shared/ui';

const FORMATS: ExportFormat[] = [
  { value: 'urls',         label: 'URLs' },
  { value: 'ids',          label: 'IDs only' },
  { value: 'with-headers', label: 'With headers' },
];

@Component({
  selector: 'app-collection-export-controls',
  imports: [ExportControlsComponent],
  templateUrl: './collection-export-controls.component.html',
  styleUrl: './collection-export-controls.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionExportControlsComponent {
  readonly exportService = inject(CollectionExportService);
  readonly store = inject(CollectionStore);

  readonly formats = FORMATS;

  async export(format: string) {
    await this.exportService.exportToFile(format as 'urls' | 'ids' | 'with-headers');
  }
}
