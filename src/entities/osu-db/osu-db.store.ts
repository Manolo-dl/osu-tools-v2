import { computed, inject } from "@angular/core";
import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { OsuPathService } from "@shared/services";
import { invoke } from "@tauri-apps/api/core";

export interface OsuBeatmapFull {
    md5: string;
    beatmapset_id: number;
    title: string;
    artist: string;
    stars: number;
    mode: number;
    status: string;
    bpm: number;
    length: number;
    lastPlayed: boolean;
}

interface OsuDbState {
    beatmaps: OsuBeatmapFull[];
    isLoading: boolean;
    isLoaded: boolean;
}

const initialState: OsuDbState = {
    beatmaps: [],
    isLoading: false,
    isLoaded: false,
};

export const OsuDbStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),

    withComputed((store) => ({
        beatmapsByMd5: computed(() =>
            new Map(store.beatmaps().map(b => [b.md5, b]))
        ),
        totalCount: computed(() => store.beatmaps().length),
        countByStatus: computed(() => {
            const counts: Record<string, number> = {};
            for (const b of store.beatmaps()) {
                counts[b.status] = (counts[b.status] ?? 0) + 1;
            }
            return counts;
        }),
        countByMode: computed(() => {
            const counts: Record<number, number> = {};
            for (const b of store.beatmaps()) {
                counts[b.mode] = (counts[b.mode] ?? 0) + 1;
            }
            return counts;
        }),
    })),

    withMethods((store, osuPath = inject(OsuPathService)) => ({
        setBeatmaps(beatmaps: OsuBeatmapFull[]) {
            patchState(store, { beatmaps, isLoaded: true, isLoading: false });
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

            const beatmaps = await invoke<OsuBeatmapFull[]>('read_osu_db_full', { osuPath: path });

            patchState(store, { beatmaps, isLoaded: true, isLoading: false });
        }
    })),
)