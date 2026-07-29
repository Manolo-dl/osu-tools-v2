import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { TosuData } from "./tosu.model";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { from, pipe, switchMap } from "rxjs";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { inject } from "@angular/core";
import { ToastStore } from "@shared/stores";

interface TosuStoreState {
    data: TosuData | null;
    connected: boolean;
}

const initialState: TosuStoreState = {
    data: null,
    connected: false,
}

export const TosuStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),

    withMethods((store, toast = inject(ToastStore)) => ({
        connect: rxMethod<void>(
            pipe(
                switchMap(() =>
                    from(
                        (async () => {
                            if (store.connected()) return;
                            
                            try {
                                await invoke('connect_tosu');
                                await listen<TosuData>('tosu-data', (event) => {
                                    patchState(store, { data: event.payload });
                                });

                                toast.show('success', 'Connected to Tosu successfully.');
                                patchState(store, { connected: true });
                            } catch {
                                toast.show('error', 'Failed to connect to Tosu. Please make sure Tosu is running and try again.');
                                patchState(store, { connected: false });
                            }
                        })()
                    )
                )
            )
        )
    }))
);