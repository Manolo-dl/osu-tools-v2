import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NavStore } from '@entities/nav-item';
import { TuiBadge, TuiStatus } from '@taiga-ui/kit';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import { TUI_DARK_MODE, TuiButton } from "@taiga-ui/core";

@Component({
  selector: 'app-header',
  imports: [FaIconComponent, TuiBadge, TuiStatus, TuiButton],
  templateUrl: './header.component.html',
  styleUrl: './header.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  readonly darkMode = inject(TUI_DARK_MODE);
  readonly navStore = inject(NavStore);
  readonly icon = computed(() => this.darkMode() ? faMoon : faSun);
}
