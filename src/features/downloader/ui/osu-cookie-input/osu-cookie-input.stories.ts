import { Meta } from '@storybook/angular-vite';
import { Story } from '@shared/models';
import { OsuCookieInputComponent } from './osu-cookie-input.component';

const meta: Meta<OsuCookieInputComponent> = {
  title: 'Features/Downloader/Osu Cookie Input',
  component: OsuCookieInputComponent,
  tags: ['autodocs'],
};

export default meta;
export const Default: Story<OsuCookieInputComponent> = {};