import { effect, inject, untracked } from "@angular/core";
import { TosuStore } from "@entities/tosu";
import { patchState, signalStore, withHooks, withMethods, withState } from "@ngrx/signals";

export interface DifficultyStat {
    value: number;
    locked: boolean;
}

export interface TrainerState {
    hp: DifficultyStat;
    cs: DifficultyStat;
    od: DifficultyStat;
    ar: DifficultyStat;
}

const initialState: TrainerState = {
    hp: { value: 5, locked: false },
    cs: { value: 5, locked: false },
    od: { value: 5, locked: false },
    ar: { value: 5, locked: false },
};

export const TrainerStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),

    withMethods((store) => ({
        setValue(stat: keyof TrainerState, value: number) {
            patchState(store, {
                [stat]: { ...store[stat](), value }
            });
        },
        toggleLock(stat: keyof TrainerState) {
            patchState(store, {
                [stat]: { ...store[stat](), locked: !store[stat]().locked }
            });
        },
    })),

    withHooks({
        onInit(store) {
            const tosu = inject(TosuStore);
            let lastBeatmapId: string | null = null;

            effect(() => {
                const data = tosu.data();
                if (!data) return;

                const currentBeatmapId = data.directPath.beatmapFile;

                if (currentBeatmapId === lastBeatmapId) return;
                lastBeatmapId = currentBeatmapId;

                const stats = data.beatmap.stats;

                untracked(() => {
                    (['hp', 'cs', 'ar', 'od'] as const).forEach((stat) => {

                        const current = store[stat]();
                        const newValue = stats[stat].original;

                        if (!current.locked && current.value !== newValue) {
                            patchState(store, {
                                [stat]: { ...current, value: stats[stat].original }
                            });
                        }
                    });
                });
            });
        },
    }),
);