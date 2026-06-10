import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { Collection, CollectionBeatmap, CollectionWithBeatmaps } from "./collection.model";

interface CollectionState {
    collections: CollectionWithBeatmaps[];
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

    withMethods((store) => ({

        setCollections(collections: CollectionWithBeatmaps[]) {
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