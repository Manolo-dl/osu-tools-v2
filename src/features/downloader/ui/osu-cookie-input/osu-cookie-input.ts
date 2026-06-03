import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { form, maxLength, minLength, pattern, required } from '@angular/forms/signals';

@Component({
  selector: 'app-osu-cookie-input',
  imports: [],
  templateUrl: './osu-cookie-input.html',
  styleUrl: './osu-cookie-input.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OsuCookieInput {

  readonly osuCookieForm = form(
    signal({ cookie: '' }),
    (schemaPath) => {
      required(schemaPath.cookie, { message: 'Osu! cookie is required' });
      pattern(schemaPath.cookie, /^[A-Za-z0-9+/=_-]+$/, { message: 'Invalid cookie format' });
      minLength(schemaPath.cookie, 300, { message: 'Cookie is too short' });
      maxLength(schemaPath.cookie, 500, { message: 'Cookie is too long' });
    }
  );
}
