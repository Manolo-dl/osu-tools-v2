import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-collection-list',
  imports: [],
  templateUrl: './collection-list.component.html',
  styleUrl: './collection-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionListComponent {}
