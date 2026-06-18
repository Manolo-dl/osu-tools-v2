import { inject } from '@angular/core';
import type { ResolveFn } from '@angular/router';
import { OsuDbStore } from './osu-db.store';

export const osuDbResolver: ResolveFn<void> = async () => {
  
  const store = inject(OsuDbStore);

  if (!store.isLoaded()) {
    await store.load();
  }
};
