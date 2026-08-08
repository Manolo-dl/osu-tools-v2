import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

const STORAGE_KEY = 'distribution-notice-dismissed';

@Component({
    selector: 'app-distribution-notice',
    imports: [],
    templateUrl: './distribution-notice.component.html',
    styleUrl: './distribution-notice.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DistributionNoticeComponent {
    dismissed = signal(localStorage.getItem(STORAGE_KEY) === 'true');

    dismiss() {
        localStorage.setItem(STORAGE_KEY, 'true');
        this.dismissed.set(true);
    }
}
