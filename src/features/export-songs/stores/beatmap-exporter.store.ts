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
    keyCount: number | null;
    minCircleSize: number | null;
    maxCircleSize: number | null;
    minAr: number | null;
    maxAr: number | null;
    minOd: number | null;
    maxOd: number | null;
    minHp: number | null;
    maxHp: number | null;
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
        lastPlayed: null,
        keyCount: null,
        minCircleSize: null,
        maxCircleSize: null,
        minAr: null,
        maxAr: null,
        minOd: null,
        maxOd: null,
        minHp: null,
        maxHp: null,
    },
};

export const BeatmapExporterStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),

    withComputed((store, osuDb = inject(OsuDbStore)) => ({
        filteredBeatmaps: computed(() => {
            const {
                mode, minStars, maxStars, status, minBpm, maxBpm, minLength, maxLength,
                lastPlayed, keyCount, minCircleSize, maxCircleSize,
                minAr, maxAr, minOd, maxOd, minHp, maxHp,
            } = store.filters();

            return osuDb.beatmapSets().filter(set => {
                if (status != null && set.status !== status) return false;

                const hasMatchingDiff = set.diffs.some(d => {
                    if (mode !== null && d.mode !== mode) return false;
                    if (minStars !== null && d.stars < minStars) return false;
                    if (maxStars !== null && d.stars > maxStars) return false;
                    if (minBpm !== null && d.bpm < minBpm) return false;
                    if (maxBpm !== null && d.bpm > maxBpm) return false;
                    if (minLength !== null && d.length < minLength) return false;
                    if (maxLength !== null && d.length > maxLength) return false;
                    if (lastPlayed !== null && d.lastPlayed !== lastPlayed) return false;
                    // AR only meaningful in Standard (0) and Catch (2)
                    if (d.mode === 0 || d.mode === 2) {
                        if (minAr !== null && d.approachRate < minAr) return false;
                        if (maxAr !== null && d.approachRate > maxAr) return false;
                    }
                    if (minOd !== null && d.overallDifficulty < minOd) return false;
                    if (maxOd !== null && d.overallDifficulty > maxOd) return false;
                    if (minHp !== null && d.hpDrain < minHp) return false;
                    if (maxHp !== null && d.hpDrain > maxHp) return false;
                    // circleSize represents key count in Mania (mode 3) and circle size in other modes
                    if (d.mode === 3) {
                        if (keyCount !== null && d.circleSize !== keyCount) return false;
                    } else {
                        if (minCircleSize !== null && d.circleSize < minCircleSize) return false;
                        if (maxCircleSize !== null && d.circleSize > maxCircleSize) return false;
                    }
                    return true;
                });

                if (mode !== null || minStars !== null || maxStars !== null ||
                    minBpm !== null || maxBpm !== null || minLength !== null ||
                    maxLength !== null || lastPlayed !== null || keyCount !== null ||
                    minCircleSize !== null || maxCircleSize !== null ||
                    minAr !== null || maxAr !== null ||
                    minOd !== null || maxOd !== null ||
                    minHp !== null || maxHp !== null) {
                    return hasMatchingDiff;
                }

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
