import { Component, inject, OnDestroy, signal } from '@angular/core';
import { ImportCollectionParserService } from '@features/collection-importer/import-collection-parser.service';
import { ImportCollectionStore } from '@features/collection-importer/import-collections.store';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { readTextFile } from '@tauri-apps/plugin-fs';

@Component({
  selector: 'app-import-file-dropzone',
  imports: [],
  templateUrl: './import-file-dropzone.component.html',
  styleUrl: './import-file-dropzone.component.css',
})
export class ImportFileDropzoneComponent implements OnDestroy {
  private store = inject(ImportCollectionStore);
  private parser = inject(ImportCollectionParserService);
  private unlisten?: () => void;

  isDragOver = signal(false);

  async ngOnInit() {
    const win = getCurrentWindow();
    this.unlisten = await win.onDragDropEvent(async (event) => {
      if (event.payload.type === 'over') {
        this.isDragOver.set(true);
      } else if (event.payload.type === 'leave') {
        this.isDragOver.set(false);
      } else if (event.payload.type === 'drop') {
        this.isDragOver.set(false);
        for (const path of event.payload.paths) {
          if (path.endsWith('.txt')) {
            const content = await readTextFile(path);
            const parsed = this.parser.parse(content);
            this.store.setParsedCollections(parsed);
          }
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.unlisten?.();
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) this.readFile(file);
    input.value = '';
  }

  private readFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const parsed = this.parser.parse(content);
      this.store.setParsedCollections(parsed);
    };
    reader.readAsText(file);
  }
}
