import { effect } from "@angular/core";
import { User } from "./user.model";
import { patchState, signalStore, withHooks, withMethods, withState } from "@ngrx/signals";
import { Store } from '@tauri-apps/plugin-store';

interface UserState {
    user: User | null;
    isLoggedIn: boolean;
    isLoading: boolean;
}

const initialState: UserState = {
    user: null,
    isLoggedIn: false,
    isLoading: false,
}

export const UserStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),

    withMethods((store) => ({
        setUser(user: User) {
            patchState(store, { user, isLoggedIn: true });
        },

        setLoading(isLoading: boolean) {
            patchState(store, { isLoading });
        },
        
        logout() {
            patchState(store, { user: null, isLoggedIn: false });
        },

        updateUser(user: Partial<User>) {
            const currentUser = store.user();
            if (!currentUser) return;

            patchState(store, {
                user: { ...currentUser, ...user }
            });
        }
    })),

    withHooks({
        onInit(store) {
            effect(async () => {
                const user = store.user();
                if (!user?.osuSessionExpiry) return;

                const expiryDate = new Date(user.osuSessionExpiry);
                if (expiryDate < new Date()) {
                    patchState(store, { user: { ...user, osuSession: undefined, osuSessionExpiry: undefined }});

                    const tauriStore = await Store.load('auth.json');
                    await tauriStore.set('user', store.user());
                    await tauriStore.save();
                }
            });
        }
    })

)