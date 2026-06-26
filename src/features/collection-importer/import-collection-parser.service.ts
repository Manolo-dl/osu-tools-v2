import { Injectable } from '@angular/core';
import { OsuCollection } from '@entities/collection';

@Injectable({
  providedIn: 'root',
})
export class ImportCollectionParserService {

  parse(content: string): OsuCollection[] {
    const collections: OsuCollection[] = [];
    let current: OsuCollection | null = null;

    for (const rawLine of content.split('\n')) {
      const line = rawLine.trim();
      if (!line) continue;

      if (line.startsWith('-')) {
        const name = line.slice(1).trim();
        current = { name, md5s: [] };
        collections.push(current);
      } else if (current) {
        current.md5s.push(line);
      }
    }

    return collections;
  }
}