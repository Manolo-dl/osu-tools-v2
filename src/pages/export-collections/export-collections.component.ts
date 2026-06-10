import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NotImplementedComponent } from '@shared/ui/not-implemented';
import { CollectionListComponent } from "@features/collection-exporter";

@Component({
  selector: 'app-export-collections',
  imports: [CollectionListComponent],
  templateUrl: './export-collections.component.html',
  styleUrl: './export-collections.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExportCollectionsComponent {}
