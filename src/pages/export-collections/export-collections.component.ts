import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NotImplementedComponent } from '@shared/ui/not-implemented';

@Component({
  selector: 'app-export-collections',
  imports: [NotImplementedComponent],
  templateUrl: './export-collections.component.html',
  styleUrl: './export-collections.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExportCollectionsComponent {}
