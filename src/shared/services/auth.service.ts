import { inject, Injectable } from '@angular/core';
import { User, UserStore } from '@entities/user';
import { invoke } from '@tauri-apps/api/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userStore = inject(UserStore);

  async login() {
    try {
      const result = await invoke<{
        access_token: string;
        refresh_token: string;
        expires_at: number;
        osu_session: string | null;
        user: {
          id: number;
          username: string;
          avatar_url: string;
        };
      }>('start_oauth');

      const user: User = {
        id: result.user.id,
        username: result.user.username,
        avatarUrl: result.user.avatar_url,
        osuSession: result.osu_session ?? undefined,
      };


      this.userStore.setUser(user);
      await this.persist(user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async logout() {
    this.userStore.logout();

    const { Store } = await import('@tauri-apps/plugin-store');
    const store = await Store.load('auth.json');
    await store.delete('user');
    await store.save();
  }

  private async persist(user: User) {
    const { Store } = await import('@tauri-apps/plugin-store');
    const store = await Store.load('auth.json');
    await store.set('user', user);
    await store.save();
  }

  async loadPersistedUser() {
    try {
      const { Store } = await import('@tauri-apps/plugin-store');
      const store = await Store.load('auth.json');
      const user = await store.get<User>('user');
  
      if (user) {
        this.userStore.setUser(user);
      }
    } catch (error) {
      console.error('Failed to load persisted user:', error);
    }
  }

}
