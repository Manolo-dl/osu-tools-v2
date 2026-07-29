import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { TosuStore } from '@entities/tosu';
import { TosuFieldTreeComponent } from '@features/tosu-data';

@Component({
    selector: 'app-tosu-data-page',
    imports: [TosuFieldTreeComponent],
    templateUrl: './tosu-data-page.component.html',
    styleUrl: './tosu-data-page.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TosuDataPage {
    store = inject(TosuStore);

    topLevelKeys(): string[] {
        const data = this.store.data();
        if (!data) return [];
        return Object.keys(data as object);
    }

    valueFor(key: string): unknown {
        const data = this.store.data();
        return data ? (data as Record<string, unknown>)[key] : undefined;
    }

    reconnect() {
        this.store.connect();
    }
}
