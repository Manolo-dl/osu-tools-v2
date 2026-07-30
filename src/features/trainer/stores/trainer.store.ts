import { effect, inject, untracked } from "@angular/core";
import { TosuStore } from "@entities/tosu";
import { patchState, signalStore, withHooks, withMethods, withState } from "@ngrx/signals";
import { DifficultyKey, DifficultyStat, MirrorParams, RateChangeParams, TrainerTask, TrainerTaskParams } from "../models/trainer.model";

interface TrainerState {
    hp: DifficultyStat;
    cs: DifficultyStat;
    od: DifficultyStat;
    ar: DifficultyStat;
    tasks: TrainerTask[];
}

const initialState: TrainerState = {
    hp: { value: 5, locked: false },
    cs: { value: 5, locked: false },
    od: { value: 5, locked: false },
    ar: { value: 5, locked: false },
    tasks: [],
};

export const TrainerStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),

    withMethods((store) => ({

        setValue(stat: DifficultyKey, value: number) {
            patchState(store, {
                [stat]: { ...store[stat](), value }
            });
        },

        toggleLock(stat: DifficultyKey) {
            patchState(store, {
                [stat]: { ...store[stat](), locked: !store[stat]().locked }
            });
        },

        addTask(task: TrainerTaskParams) {
            const newTask: TrainerTask = { id: crypto.randomUUID(), task };
            patchState(store, { tasks: [...store.tasks(), newTask] });
        },

        removeTask(id: string) {
            patchState(store, { tasks: store.tasks().filter(task => task.id !== id) });
        },

        updateTaskParams(id: string, params: RateChangeParams | MirrorParams | {}) {
            patchState(store, {
                tasks: store.tasks().map(t =>
                    t.id === id ? { ...t, task: { ...t.task, params } as TrainerTaskParams } : t
                ),
            });
        },

        reorderTasks(previousIndex: number, currentIndex: number) {
            const tasks = [...store.tasks()];
            const [moved] = tasks.splice(previousIndex, 1);
            tasks.splice(currentIndex, 0, moved);
            patchState(store, { tasks });
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