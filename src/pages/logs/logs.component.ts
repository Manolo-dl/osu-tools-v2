import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LogStore } from '@entities/log';
import { LogColumnComponent } from '@features/logs';

@Component({
  selector: 'app-logs',
  imports: [LogColumnComponent],
  templateUrl: './logs.component.html',
  styleUrl: './logs.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogsComponent {
  readonly store = inject(LogStore);

  async reload() {
    await this.store.load();
  }
}
