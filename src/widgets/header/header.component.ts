import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemeService, Theme } from '@shared/services';
import { NavStore } from '@entities/nav-item';
import { TuiBadge, TuiStatus } from '@taiga-ui/kit';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { TuiButton } from "@taiga-ui/core";

@Component({
  selector: 'app-header',
  imports: [FaIconComponent, TuiBadge, TuiStatus, TuiButton],
  templateUrl: './header.component.html',
  styleUrl: './header.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  readonly themeService = inject(ThemeService);
  readonly navStore = inject(NavStore);
}
