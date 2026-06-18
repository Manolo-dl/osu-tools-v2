import { inject } from '@angular/core';
import type { ResolveFn } from '@angular/router';
import { CollectionStore } from './collection-store';

export const collectionResolver: ResolveFn<void> = async () => {
  const store = inject(CollectionStore);

  if (!store.isLoaded()) {
    await store.load();
  }
};
