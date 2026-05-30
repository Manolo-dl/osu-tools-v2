import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { phosphorSignIn } from '@ng-icons/phosphor-icons/regular';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { UserStore } from '@entities/user';

@Component({
  selector: 'app-header',
  imports: [NgIconComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ phosphorSignIn })],
})
export class HeaderComponent {
  readonly userStore = inject(UserStore);
}
