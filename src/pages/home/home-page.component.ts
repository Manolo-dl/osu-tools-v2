import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { OsuPathStore } from '@shared/stores';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {
  readonly osuPath = inject(OsuPathStore);
}
