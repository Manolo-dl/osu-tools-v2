import { Component, inject } from '@angular/core';
import { ImportCollectionStore } from '@features/collection-importer';

@Component({
  selector: 'app-import-preview',
  imports: [],
  templateUrl: './import-preview.component.html',
  styleUrl: './import-preview.component.css',
})
export class ImportPreviewComponent {
  readonly store = inject(ImportCollectionStore);

  isExisting(name: string): boolean {
    return this.store.existingNames().has(name);
  }
}
