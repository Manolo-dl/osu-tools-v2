import { Component, inject, signal } from '@angular/core';
import { OsuBeatmapSet, OsuDiff } from '@entities/osu-db';
import { PackStore } from '@entities/pack';
import { CdkFixedSizeVirtualScroll, CdkVirtualForOf } from "@angular/cdk/scrolling";
import { PackBrowserCardComponent } from '../pack-browser-card/pack-browser-card.component'; 

@Component({
  selector: 'app-pack-browser',
  imports: [CdkFixedSizeVirtualScroll, CdkVirtualForOf, PackBrowserCardComponent],
  templateUrl: './pack-browser.component.html',
  styleUrl: './pack-browser.component.css',
})
export class PackBrowserComponent {

  readonly store = inject(PackStore);

  trackSet(_index: number, set: OsuBeatmapSet): number {
    return set.beatmapsetId;
  }
}
