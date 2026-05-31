import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { phosphorSignIn, phosphorSun, phosphorMoon, phosphorDesktop } from '@ng-icons/phosphor-icons/regular';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { UserStore } from '@entities/user';
import { AuthService, ThemeService, Theme } from '@shared/services';

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
  providers: [provideIcons({ phosphorSignIn, phosphorSun, phosphorMoon, phosphorDesktop })],
})
export class HeaderComponent {
  readonly userStore = inject(UserStore);
  readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);

  get themeIcon() { return THEME_ICON[this.themeService.theme()]; }
  get themeLabel() { return THEME_LABEL[this.themeService.theme()]; }

  async login() { await this.authService.login(); }
  async logout() { await this.authService.logout(); }
}
