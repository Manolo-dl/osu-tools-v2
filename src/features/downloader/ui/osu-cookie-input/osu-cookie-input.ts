import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { form, maxLength, minLength, required, FormRoot, FormField } from '@angular/forms/signals';
import { UserStore } from '@entities/user';
import { StatefulInputComponent } from "@shared/ui";

@Component({
  selector: 'app-osu-cookie-input',
  imports: [FormRoot, StatefulInputComponent, FormField],
  templateUrl: './osu-cookie-input.html',
  styleUrl: './osu-cookie-input.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OsuCookieInput {

  readonly userStore = inject(UserStore);

  readonly osuCookieForm = form(
    signal({ osuSession: '', osuSessionExpiry: '' }),
    (schemaPath) => {
      required(schemaPath.osuSession, { message: 'Osu! cookie is required' });
      minLength(schemaPath.osuSession, 300, { message: 'Cookie is too short' });
      maxLength(schemaPath.osuSession, 500, { message: 'Cookie is too long' });
    },
    {
      submission: {
        action: async (field) => {
          const previous = this.userStore.user()?.osuSession ?? '';
          const previousExpiry = this.userStore.user()?.osuSessionExpiry ?? '';
          try {
            const expiry = field().value().osuSessionExpiry.trim() || undefined;
            this.userStore.updateUser({ osuSession: field().value().osuSession, osuSessionExpiry: expiry });
            field().value.set({ osuSession: '', osuSessionExpiry: '' });
            field().reset();
            return null;
          } catch {
            if (previous) field().value.set({ osuSession: previous, osuSessionExpiry: previousExpiry });
            return { kind: 'error', message: 'Failed to update cookie' };
          }
        },
        ignoreValidators: 'none',
      }
    }
  );

  clearSession() {
    this.userStore.updateUser({ osuSession: undefined, osuSessionExpiry: undefined });
  }

  formatExpiry(iso?: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    return isNaN(d.getTime()) ? iso : d.toLocaleDateString(undefined, { dateStyle: 'medium' });
  }
}
