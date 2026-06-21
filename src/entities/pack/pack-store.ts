import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { PackRequest, SelectedDiff } from "./pack-model";
import { invoke } from "@tauri-apps/api/core";
import { computed, inject } from "@angular/core";
import { OsuDbStore } from "@entities/osu-db";

interface PackStoreState {
    selectedDiffs: SelectedDiff[];
    title: string;
    finalCreator: string;
    isCreating: boolean;
    searchQuery: string;
}

const initialState: PackStoreState = {
    selectedDiffs: [],
    title: '',
    finalCreator: '',
    isCreating: false,
    searchQuery: '',
}
export const PackStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),

    withComputed((store, osuDbStore = inject(OsuDbStore)) => ({
        filteredSets: computed(() => {
            const query = store.searchQuery().toLowerCase().trim();
            const sets = osuDbStore.beatmapSets();

            if (!query) return sets;

            return sets.filter(set =>
                set.title.toLowerCase().includes(query) ||
                set.artist.toLowerCase().includes(query) ||
                set.diffs.some(diff => diff.fileName.toLowerCase().includes(query))
            );
        }),

        addedMd5s: computed(() =>
            new Set(store.selectedDiffs().map(diff => diff.md5))
        ),
    })),

    withMethods((store) => ({
        toggleDiff(diff: SelectedDiff) {
            const diffs = store.selectedDiffs();
            const index = diffs.findIndex(d => d.md5 === diff.md5);

            if (index === -1) {
                patchState(store, { selectedDiffs: [...diffs, diff] });
            } else {
                const newDiffs = [...diffs];
                newDiffs.splice(index, 1);
                patchState(store, { selectedDiffs: newDiffs });
            }
        },

        updateDiffName(diff: SelectedDiff, newDiffName: string) {
            const diffs = store.selectedDiffs();
            const index = diffs.findIndex(d => d.md5 === diff.md5);

            if (index >= 0) {
                const newDiffs = [...diffs];
                newDiffs[index] = { ...newDiffs[index], newDiffName };
                patchState(store, { selectedDiffs: newDiffs });
            }
        },

        setTitle(title: string) {
            patchState(store, { title });
        },

        clear() {
            patchState(store, initialState);
        },

        async createPack() {
            try {
                patchState(store, { isCreating: true });
                await invoke('create_pack', {
                    request: {
                        title: store.title(),
                        finalCreator: store.finalCreator(),
                        diffs: store.selectedDiffs()
                    }
                });
                patchState(store, { isCreating: false });
            } catch (error) {
                patchState(store, { isCreating: false });
                throw error;
            }
        },

        setSearchQuery(query: string) {
            patchState(store, { searchQuery: query });
        }
    })),
)