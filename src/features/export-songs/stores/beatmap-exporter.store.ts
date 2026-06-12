import { computed, inject } from "@angular/core";
import { OsuDbStore } from "@entities/osu-db";
import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";

export interface BeatmapFilters {
    mode: number | null;
    minStars: number | null;
    maxStars: number | null;
    status: string | null;
    minBpm: number | null;
    maxBpm: number | null;
    minLength: number | null;
    maxLength: number | null;
    lastPlayed: boolean | null;
}

interface BeatmapExporterState {
    filters: BeatmapFilters;
}

const initialState: BeatmapExporterState = {
    filters: {
        mode: null,
        minStars: null,
        maxStars: null,
        status: null,
        minBpm: null,
        maxBpm: null,
        minLength: null,
        maxLength: null,
        lastPlayed: null
    },
};

export const BeatmapExporterStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),

    withComputed((store, osuDb = inject(OsuDbStore)) => ({
        filteredBeatmaps: computed(() => {
            const { mode, minStars, maxStars, status, minBpm, maxBpm, minLength, maxLength, lastPlayed } = store.filters();

            return osuDb.beatmaps().filter(b => {
                if (mode !== null && b.mode !== mode) return false;
                if (status !== null && b.status !== status) return false;
                if (minStars !== null && b.stars < minStars) return false;
                if (maxStars !== null && b.stars > maxStars) return false;
                if (minBpm !== null && b.bpm < minBpm) return false;
                if (maxBpm !== null && b.bpm > maxBpm) return false;
                if (minLength !== null && b.length < minLength) return false;
                if (maxLength !== null && b.length > maxLength) return false;
                if (lastPlayed !== null && b.lastPlayed !== lastPlayed) return false;
                return true;
            });
        }),
    })),

    withComputed((store) => ({
        totalFiltered: computed(() => store.filteredBeatmaps().length),
    })),

    withMethods((store) => ({
        setFilters(filters: Partial<BeatmapFilters>) {
            patchState(store, { filters: { ...store.filters(), ...filters }});
        },
        resetFilters() {
            patchState(store, { filters: initialState.filters });
        }
    }))
)