import { signalStore, withMethods, withState } from "@ngrx/signals";
import { TosuData } from "./tosu.model";

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
)