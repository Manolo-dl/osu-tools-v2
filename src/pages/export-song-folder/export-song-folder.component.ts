import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NotImplementedComponent } from '@shared/ui/not-implemented';

@Component({
  selector: 'app-export-song-folder',
  imports: [NotImplementedComponent],
  templateUrl: './export-song-folder.component.html',
  styleUrl: './export-song-folder.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExportSongFolderComponent {}
