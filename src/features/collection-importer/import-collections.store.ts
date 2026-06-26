import { computed, inject } from "@angular/core";
import { CollectionStore, OsuCollection } from "@entities/collection";
import { OsuDbStore } from "@entities/osu-db";
import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { ToastStore } from "@shared/stores";
import { invoke } from "@tauri-apps/api/core";


interface ImportCollectionState {
    parsedCollections: OsuCollection[];
    isImporting: boolean;
}

const initialState: ImportCollectionState = {
    parsedCollections: [],
    isImporting: false,
};

export const ImportCollectionStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),

    withComputed((store, collectionStore = inject(CollectionStore), osuDB = inject(OsuDbStore)) => ({
        existingNames: computed(() => new Set(collectionStore.collections().map(c => c.name))),

        totalMaps: computed(() => store.parsedCollections().reduce((sum, c) => sum + c.md5s.length, 0)),

        preview: computed(() => {
            const diffsByMd5 = osuDB.diffsByMd5();
            const beatmapSetsByMd5 = osuDB.beatmapSetsByMd5();

            return store.parsedCollections().map(col => {
                const maps = col.md5s.map(md5 => {
                    const diff = diffsByMd5.get(md5);
                    const set = beatmapSetsByMd5.get(md5);

                    return {
                        md5,
                        found: !!diff,
                        title: set?.title ?? 'Unknown',
                        artist: set?.artist ?? 'Unknown',
                        diffName: diff?.diffName ?? 'Unknown',
                    };
                });

                const foundCount = maps.filter(m => m.found).length;

                return {
                    name: col.name,
                    maps,
                    foundCount,
                    missingCount: maps.length - foundCount,
                };
            });
        }),
    })),

    withMethods((store, toast = inject(ToastStore)) => ({
        setParsedCollections(parsedCollections: OsuCollection[]) {
            patchState(store, { parsedCollections })
        },

        clear() {
            patchState(store, initialState);
        },

        async importCollections() {
            const collections = store.parsedCollections();
            if (collections.length === 0) return;

            patchState(store, { isImporting: true });

            try {
                await invoke('import_collections', { collections });
                toast.show('success', 'Collections imported successfully');
                patchState(store, initialState);
            } catch (error) {
                toast.show('error', 'Failed to import collections');
                patchState(store, { isImporting: false });
                throw error;
            }
        }
    })),
)