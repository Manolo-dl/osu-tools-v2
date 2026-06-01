import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { DownloadItem, DownloadStatus } from "./beatmap.model";

interface BeatmapState {
    queue: DownloadItem[];
    isDownloading: boolean;
}

const initialState: BeatmapState = {
    queue: [],
    isDownloading: false,
};

export const BeatmapStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),

    withMethods((store) => ({

        addToQueue(items: DownloadItem[]) {
            const existing = store.queue().map(i => i.beatmapSetId);
            const newItems = items.filter(i => !existing.includes(i.beatmapSetId));

            patchState(store, { queue: [...store.queue(), ...newItems]});
        },

        updateStatus(beatmapSetId: number, status: DownloadStatus, progress = 0) {
            patchState(store, {
                queue: store.queue().map(item =>
                    item.beatmapSetId === beatmapSetId
                        ? { ...item, status, progress }
                        : item
                )
            });
        },

        clearQueue() {
            patchState(store, { queue: [] });
        },

        setDownloading(isDownloading: boolean) {
            patchState(store, { isDownloading });
        },

        removeItem(beatmapSetId: number) {
            patchState(store, {
                queue: store.queue().filter(i => i.beatmapSetId !== beatmapSetId)
            });
        }
    })),
);