import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { phosphorHouse, phosphorDownloadSimple, phosphorFolder, phosphorMusicNote } from '@ng-icons/phosphor-icons/regular';
import { provideIcons, NgIcon } from '@ng-icons/core';
import { DEV_ITEMS, NavItem, NavStore, USER_ITEMS } from '@entities/nav-item';
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, NgIcon],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({
    phosphorHouse,
    phosphorDownloadSimple,
    phosphorFolder,
    phosphorMusicNote
  })]
})
export class SidebarComponent {

  readonly navStore = inject(NavStore);

  readonly userItems: NavItem[] = USER_ITEMS;
  readonly devItems: NavItem[] = DEV_ITEMS;
}
