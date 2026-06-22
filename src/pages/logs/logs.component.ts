import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LogViewerComponent } from '@features/logs';

@Component({
  selector: 'app-logs',
  imports: [LogViewerComponent],
  templateUrl: './logs.component.html',
  styleUrl: './logs.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogsComponent {}
