import { computed, inject } from "@angular/core";
import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { OsuPathService } from "@shared/services";
import { invoke } from "@tauri-apps/api/core";
import { OsuBeatmapSet, OsuDiff } from "./osu-db-model";

interface OsuDbState {
    beatmapSets: OsuBeatmapSet[];
    isLoading: boolean;
    isLoaded: boolean;
}

const initialState: OsuDbState = {
    beatmapSets: [],
    isLoading: false,
    isLoaded: false,
};

export const OsuDbStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),

    withComputed((store) => ({
        diffsByMd5: computed(() => {
            const map = new Map<string, OsuDiff>();
            for (const set of store.beatmapSets()) {
                for (const diff of set.diffs) {
                    map.set(diff.md5, diff);
                }
            }
            return map;
        }),

        totalSets: computed(() => store.beatmapSets().length),

        totalDiffs: computed(() =>
            store.beatmapSets().reduce((sum, s) => sum + s.diffs.length, 0)
        ),

        countByStatus: computed(() => {
            const counts: Record<string, number> = {};
            for (const s of store.beatmapSets()) {
                counts[s.status] = (counts[s.status] || 0) + 1;
            }
            return counts;
        }),

        countByMode: computed(() => {
            const counts: Record<number, number> = {};
            for (const s of store.beatmapSets()) {
                for (const d of s.diffs) {
                    counts[d.mode] = (counts[d.mode] ?? 0) + 1;
                }
            }
            return counts;
        }),
    })),

    withMethods((store, osuPath = inject(OsuPathService)) => ({
        setBeatmapSets(beatmapSets: OsuBeatmapSet[]) {
            patchState(store, { beatmapSets, isLoaded: true, isLoading: false });
        },

        setLoading(isLoading: boolean) {
            patchState(store, { isLoading });
        },

        reset() {
            patchState(store, initialState);
        },

        async load() {
            const path = osuPath.path();
            if (!path) throw new Error("Osu! path not set");

            patchState(store, { isLoading: true });

            const beatmapSets = await invoke<OsuBeatmapSet[]>('read_osu_db_full');

            patchState(store, { beatmapSets, isLoaded: true, isLoading: false });
        }
    })),
)