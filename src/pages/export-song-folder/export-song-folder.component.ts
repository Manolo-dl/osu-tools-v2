import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BeatmapFiltersComponent } from '@features/export-songs'; 

@Component({
  selector: 'app-export-song-folder',
  imports: [BeatmapFiltersComponent],
  templateUrl: './export-song-folder.component.html',
  styleUrl: './export-song-folder.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExportSongFolderComponent {}
