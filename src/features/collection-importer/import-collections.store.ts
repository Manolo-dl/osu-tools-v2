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

        previewSets: computed(() => {
            const beatmapSetsByMd5 = osuDB.beatmapSetsByMd5();
            const importedMd5s = new Set(
                store.parsedCollections().flatMap(c => c.md5s)
            );
            const seen = new Set<number>();
            const sets = [];

            for (const md5 of importedMd5s) {
                const set = beatmapSetsByMd5.get(md5);
                if (!set) continue;
                if (seen.has(set.beatmapsetId)) continue;
                seen.add(set.beatmapsetId);
                sets.push({
                    ...set,
                    diffs: set.diffs.filter(d => importedMd5s.has(d.md5)),
                });
            }
            return sets;
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