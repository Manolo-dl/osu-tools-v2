import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'dark' | 'light' | 'system';

const STORAGE_KEY = 'theme';
const CYCLE: Record<Theme, Theme> = { system: 'dark', dark: 'light', light: 'system' };

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<Theme>(
    (localStorage.getItem(STORAGE_KEY) as Theme) ?? 'system'
  );

  constructor() {
    effect(() => {
      const t = this.theme();
      if (t === 'system') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', t);
      }
    });
  }

  toggle() {
    const next = CYCLE[this.theme()];
    this.theme.set(next);
    localStorage.setItem(STORAGE_KEY, next);
  }
}
