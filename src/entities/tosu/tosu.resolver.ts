import type { ResolveFn } from '@angular/router';

export const tosuResolver: ResolveFn<boolean> = (route, state) => {
  return true;
};
