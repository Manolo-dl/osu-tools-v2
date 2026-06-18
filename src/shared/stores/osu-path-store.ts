import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';

interface OsuPathState {
  path: string | null;
  error: string | null;
  isLoading: boolean;
}

export const OsuPathStore = signalStore(
  { providedIn: 'root' },
  withState<OsuPathState>({ path: null, error: null, isLoading: false }),

  withMethods((store) => {
    let detectPromise: Promise<void> | undefined;

    async function doDetect() {
      patchState(store, { isLoading: true });
      try {
        const path = await invoke<string>('get_osu_path');
        patchState(store, { path, error: null });
        await invoke('save_osu_path', { path });
      } catch (error) {
        patchState(store, { error: error as string });
        detectPromise = undefined;
      } finally {
        patchState(store, { isLoading: false });
      }
    }

    return {
      async detect(): Promise<void> {
        if (!detectPromise) {
          detectPromise = doDetect();
        }
        return detectPromise;
      },

      async selectManually() {
        const selected = await open({
          directory: true,
          multiple: false,
          title: 'Select your osu! folder',
        });

        if (selected) {
          patchState(store, { path: selected as string, error: null });
          detectPromise = Promise.resolve();
          try {
            await invoke('save_osu_path', { path: selected });
          } catch (e) {
            console.error('Failed to save osu! path:', e);
          }
        }
      },
    };
  }),
);
