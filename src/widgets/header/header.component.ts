import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { phosphorSun, phosphorMoon, phosphorDesktop } from '@ng-icons/phosphor-icons/regular';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ThemeService, Theme } from '@shared/services';
import { NavStore } from '@entities/nav-item';

const THEME_ICON: Record<Theme, string> = {
  dark:   'phosphorMoon',
  light:  'phosphorSun',
  system: 'phosphorDesktop',
};

const THEME_LABEL: Record<Theme, string> = {
  dark:   'Dark',
  light:  'Light',
  system: 'System',
};

@Component({
  selector: 'app-header',
  imports: [NgIcon],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ phosphorSun, phosphorMoon, phosphorDesktop })],
})
export class HeaderComponent {
  readonly themeService = inject(ThemeService);
  readonly navStore = inject(NavStore);

  get themeIcon() { return THEME_ICON[this.themeService.theme()]; }
  get themeLabel() { return THEME_LABEL[this.themeService.theme()]; }
}
