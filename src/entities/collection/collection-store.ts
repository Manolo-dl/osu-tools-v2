import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { OsuCollection } from "./collection-model";
import { computed, inject } from "@angular/core";
import { OsuDbStore } from "@entities/osu-db";
import { OsuBeatmapSet } from "@entities/osu-db/osu-db-model";
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
            const setsByMd5 = osuDb.beatmapSetsByMd5();

            return store.collections().map(col => {
                const seenIds = new Set<number>();
                const sets = col.md5s
                    .map(md5 => setsByMd5.get(md5))
                    .filter((set): set is OsuBeatmapSet => set !== undefined)
                    .filter(set => {
                        if (seenIds.has(set.beatmapsetId)) return false;
                        seenIds.add(set.beatmapsetId);
                        return true;
                    });

                return { name: col.name, sets };
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
