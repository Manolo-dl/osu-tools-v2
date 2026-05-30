import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { phosphorSignIn } from '@ng-icons/phosphor-icons/regular';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { UserStore } from '@entities/user';
import { AuthService } from '@shared/services';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ phosphorSignIn })],
})
export class HeaderComponent {
  readonly userStore = inject(UserStore);
  authService = inject(AuthService);

  async login() {
    await this.authService.login();
  }

  async logout() {
    await this.authService.logout();
  }
}
