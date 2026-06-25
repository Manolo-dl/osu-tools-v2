import { effect } from "@angular/core";
import { User } from "./user.model";
import { patchState, signalStore, withHooks, withMethods, withState } from "@ngrx/signals";
import { Store } from '@tauri-apps/plugin-store';

interface UserState {
    user: User | null;
}

const initialState: UserState = {
    user: null,
};

export const UserStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),

    withMethods((store) => ({
        updateUser(partial: Partial<User>) {
            const current = store.user();
            patchState(store, { user: current ? { ...current, ...partial } : partial as User });
        },

        clearSession() {
            patchState(store, { user: null });
        },
    })),

    withHooks({
        onInit(store) {
            (async () => {
                try {
                    const tauriStore = await Store.load('auth.json');
                    const user = await tauriStore.get<User>('user');
                    if (user) patchState(store, { user });
                } catch {}
            })();

            effect(async () => {
                const user = store.user();
                try {
                    const tauriStore = await Store.load('auth.json');
                    if (user) {
                        await tauriStore.set('user', user);
                    } else {
                        await tauriStore.delete('user');
                    }
                    await tauriStore.save();
                } catch {}
            });
        }
    })
);
