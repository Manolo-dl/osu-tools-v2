import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { PackRequest, SelectedDiff } from "./pack-model";
import { invoke } from "@tauri-apps/api/core";

interface PackStoreState {
    selectedDiffs: SelectedDiff[];
    title: string;
    finalCreator: string;
    isCreating: boolean;
}

const initialState: PackStoreState = {
    selectedDiffs: [],
    title: '',
    finalCreator: '',
    isCreating: false,
}
export const PackStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),

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
        }
    })),
)