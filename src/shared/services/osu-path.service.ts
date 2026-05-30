import { Injectable, signal } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';

@Injectable({
  providedIn: 'root',
})
export class OsuPathService {
  path = signal<string | null>(null);
  error = signal<string | null>(null);
  isLoading = signal<boolean>(false);

  async detect() {
    this.isLoading.set(true);
    try {
      const path = await invoke<string>('get_osu_path');
      this.path.set(path);
      this.error.set(null);
    } catch (error) {
      this.error.set(error as string);
    } finally {
      this.isLoading.set(false);
    }
  }

  async selectManually() {
    const selected = await open({
      directory: true,
      multiple: false,
      title: 'Select your osu! folder',
    });

    if (selected) {
      this.path.set(selected as string);
      this.error.set(null);
      await invoke('save_osu_path', { path: selected });
    }
  }
}
