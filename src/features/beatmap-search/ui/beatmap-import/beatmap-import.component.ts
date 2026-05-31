import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BeatmapStore } from '@entities/beatmap';
import { TxtParserService } from '@features/beatmap-search/txt-parser.service';

@Component({
  selector: 'app-beatmap-import',
  imports: [],
  templateUrl: './beatmap-import.component.html',
  styleUrl: './beatmap-import.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BeatmapImportComponent {
  private beatmapStore = inject(BeatmapStore);
  private parser = inject(TxtParserService);

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) this.readFile(file);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.readFile(file);
  }

  private readFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const items = this.parser.parse(content);
      this.beatmapStore.addToQueue(items);
    };
    reader.readAsText(file);
  }
}
