import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorDownloadSimple, phosphorFolder, phosphorMusicNote } from '@ng-icons/phosphor-icons/regular';
import { OsuPathStore } from '@shared/services';

@Component({
  selector: 'app-home',
  imports: [RouterLink, NgIcon],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ phosphorDownloadSimple, phosphorFolder, phosphorMusicNote })],
})
export class HomeComponent {
  readonly osuPath = inject(OsuPathStore);
}
