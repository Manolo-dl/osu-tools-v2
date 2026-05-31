import { Injectable } from '@angular/core';
import { DownloadItem } from '@entities/beatmap';

@Injectable({
  providedIn: 'root',
})
export class TxtParserService {

  parse(content: string): DownloadItem[] {
    const items: DownloadItem[] = [];

    for (const line of content.split('\n')) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//') || trimmed.startsWith('---')) continue;

      const id = this.extractBeatmapSetId(trimmed);
      if (id) {
        items.push({
          beatmapSetId: id,
          title: '',
          artist: '',
          status: 'pending',
          progress: 0,
        });
      }
    }
    return items;
  }

  private extractBeatmapSetId(url: string): number | null {
    const match = url.match(/beatmapsets\/(\d+)/);
    if (match) return parseInt(match[1]);

    if (/^\d+$/.test(url)) return parseInt(url);
    
    return null;
  }
}
