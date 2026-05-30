import { ChangeDetectionStrategy, Component } from '@angular/core';
import { phosphorHouse, phosphorDownloadSimple, phosphorFolder, phosphorMusicNote } from '@ng-icons/phosphor-icons/regular';
import { provideIcons, NgIcon } from '@ng-icons/core';
import { NAV_ITEMS, NavItem } from '@entities/nav-item';
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

  readonly navItems: NavItem[] = NAV_ITEMS;
}
