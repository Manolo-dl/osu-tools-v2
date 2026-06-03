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
        accessToken: result.access_token,
        refreshToken: result.refresh_token,
        tokenExpiresAt: result.expires_at,
      };


      this.userStore.setUser(user);
      await this.persist(user);

      console.log('Login successful:', user);
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

  async getValidToken(): Promise<string | null> {
    const user = this.userStore.user();
    if (!user?.accessToken) return null;

    if (user.tokenExpiresAt && Date.now() > user.tokenExpiresAt) {
      return await this.refreshToken();
    }

    return user.accessToken;
  }

  private async refreshToken(): Promise<string | null> {
    try {
      const user = this.userStore.user();
      if (!user?.refreshToken) return null;

      const token = await invoke<{
        access_token: string;
        refresh_token: string;
        expires_at: number;
      }>('refresh_oauth_token', {
        refreshToken: user.refreshToken,
      });

      this.userStore.updateUser({
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        tokenExpiresAt: token.expires_at,
      });


      await this.persist(user);
      return token.access_token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }

}
