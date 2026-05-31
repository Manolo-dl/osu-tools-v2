import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorHammer } from '@ng-icons/phosphor-icons/regular';

@Component({
  selector: 'app-not-implemented',
  imports: [NgIcon],
  templateUrl: './not-implemented.component.html',
  styleUrl: './not-implemented.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ phosphorHammer })],
})
export class NotImplementedComponent {
  feature = input<string>();
}
