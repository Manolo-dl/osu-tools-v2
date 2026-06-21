import { Component, inject, signal } from '@angular/core';
import { OsuBeatmapSet, OsuDiff } from '@entities/osu-db';
import { PackStore } from '@entities/pack/pack-store';

@Component({
  selector: 'app-pack-browser',
  imports: [],
  templateUrl: './pack-browser.component.html',
  styleUrl: './pack-browser.component.css',
})
export class PackBrowserComponent {

  readonly store = inject(PackStore);
  private expandedId = signal<number | null>(null);

  toggleExpand(beatmapsetId: number, event: Event) {
    event.stopPropagation();
    this.expandedId.update(current => current === beatmapsetId ? null : beatmapsetId);
  }

  isExpanded(beatmapsetId: number): boolean {
    return this.expandedId() === beatmapsetId;
  }

  isAdded(md5: string): boolean {
    return this.store.addedMd5s().has(md5);
  }

  addDiff(set: OsuBeatmapSet, diff: OsuDiff) {
    const newDiffName = this.generateDefaultName(set, diff);

    this.store.toggleDiff({
      md5: diff.md5,
      beatmapsetId: set.beatmapsetId,
      fileName: diff.fileName,
      audio: diff.audio,
      newDiffName,
    });
  }

  private generateDefaultName(set: OsuBeatmapSet, diff: OsuDiff): string {
    return `[${diff.creator}] ${set.artist} - ${set.title} (${diff.diffName})`;
  }
}
