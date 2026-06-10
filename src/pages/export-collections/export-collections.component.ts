import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CollectionListComponent, CollectionSummaryComponent } from "@features/collection-exporter";
import { CollectionPreviewComponent } from "@features/collection-exporter/ui/collection-preview/collection-preview.component";

@Component({
  selector: 'app-export-collections',
  imports: [CollectionListComponent, CollectionSummaryComponent, CollectionPreviewComponent],
  templateUrl: './export-collections.component.html',
  styleUrl: './export-collections.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExportCollectionsComponent {}
