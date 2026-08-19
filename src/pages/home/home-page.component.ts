import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {
}
