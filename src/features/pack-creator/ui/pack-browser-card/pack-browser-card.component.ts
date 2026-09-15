import { DecimalPipe, NgClass } from '@angular/common';
import { Component, inject, input, signal } from '@angular/core';
import { OsuBeatmapSet, OsuDiff } from '@entities/osu-db';
import { PackStore } from '@entities/pack';

@Component({
  selector: 'app-pack-browser-card',
  imports: [DecimalPipe, NgClass],
  templateUrl: './pack-browser-card.component.html',
  styleUrl: './pack-browser-card.component.css',
})
export class PackBrowserCardComponent {

  readonly set = input.required<OsuBeatmapSet>();
  readonly store = inject(PackStore);

  readonly expanded = signal(false);

  setStatus(): string {
    const priority = ['ranked', 'approved', 'qualified', 'loved', 'unranked', 'unsubmitted', 'unknown'];
    const statuses = new Set(this.set().diffs.map(d => d.status));
    for (const p of priority) {
      if (statuses.has(p)) return p;
    }
    return 'unknown';
  }

  toggleExpand(event: Event) {
    event.stopPropagation();
    this.expanded.update(v => !v);
  }

  addDiff(diff: OsuDiff, event: Event) {
    event.stopPropagation();
    const set = this.set();
    const newDiffName = `[${diff.creator}] ${set.artist} - ${set.title} (${diff.diffName})`;

    this.store.toggleDiff({
      md5: diff.md5,
      folderName: set.folderName,
      fileName: diff.fileName,
      audio: diff.audio,
      newDiffName: newDiffName,
    });
  }
}