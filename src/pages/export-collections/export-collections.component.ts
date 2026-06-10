import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CollectionListComponent, CollectionSummaryComponent } from "@features/collection-exporter";

@Component({
  selector: 'app-export-collections',
  imports: [CollectionListComponent, CollectionSummaryComponent],
  templateUrl: './export-collections.component.html',
  styleUrl: './export-collections.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExportCollectionsComponent {}
