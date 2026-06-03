import { User } from "./user.model";
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";

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

)