import { signalStore, withMethods, withState } from "@ngrx/signals";
import { Collection, CollectionBeatmap } from "./collection.model";

interface CollectionState {
    collections: Collection[];
    selectedCollections: string[];
    beatmaps: Record<string, CollectionBeatmap>;
    isLoading: boolean;
    isLoaded: boolean;
}

const initialState: CollectionState = {
    collections: [],
    selectedCollections: [],
    beatmaps: {},
    isLoading: false,
    isLoaded: false
};

export const collectionStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),

    
)