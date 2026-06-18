import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { OsuCollection } from "./collection-model";
import { computed, inject } from "@angular/core";
import { OsuDbStore } from "@entities/osu-db";
import { OsuPathService } from "@shared/services";
import { invoke } from "@tauri-apps/api/core";


interface CollectionState {
    collections: OsuCollection[];
    selectedCollections: string[];
    isLoading: boolean;
    isLoaded: boolean;
}

const initialState: CollectionState = {
    collections: [],
    selectedCollections: [],
    isLoading: false,
    isLoaded: false
};

export const CollectionStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),

    withComputed((store, osuDb = inject(OsuDbStore)) => ({
        collectionsWithBeatmaps: computed(() => {
            const diffsByMd5 = osuDb.diffsByMd5();
            const beatmapSetIdByMd5 = osuDb.beatmapSetIdByMd5();

            return store.collections().map(col => {
                const seenSets = new Set<number>();
                const beatmaps = col.md5s
                    .map(md5 => {
                        const diff = diffsByMd5.get(md5);
                        const setId = beatmapSetIdByMd5.get(md5);
                        return diff && setId !== undefined ? { diff, setId } : null;
                    })
                    .filter(b => b !== null)
                    .filter(b => {
                        if (seenSets.has(b!.setId)) return false;
                        seenSets.add(b!.setId);
                        return true;
                    })
                    .map(b => b!.diff);

                return { name: col.name, beatmaps };
            });
        }),
    })),

    withMethods((store, osuPath = inject(OsuPathService)) => ({

        async load() {
            const path = osuPath.path();
            if (!path) throw new Error("Osu! path not set");

            patchState(store, { isLoading: true });
            const collections = await invoke<OsuCollection[]>("read_osu_collections");
            patchState(store, { collections, isLoaded: true, isLoading: false });
        },

        setCollections(collections: OsuCollection[]) {
            patchState(store, { collections, isLoaded: true, isLoading: false });
        },

        setLoading(isLoading: boolean) {
            patchState(store, { isLoading });
        },

        toggleSelection(name: string) {
            const selected = store.selectedCollections();
            const isSelected = selected.includes(name);

            patchState(store, {
                selectedCollections: isSelected
                    ? selected.filter(c => c !== name)
                    : [...selected, name]
            });
        },

        selectAll() {
            patchState(store, {
                selectedCollections: store.collections().map(c => c.name)
            });
        },

        clearSelection() {
            patchState(store, { selectedCollections: [] });
        },

        reset() {
            patchState(store, initialState);
        }
    })),
);