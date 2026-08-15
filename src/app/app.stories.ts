import { applicationConfig, Meta } from '@storybook/angular-vite';
import { Story } from '@shared/models';
import { AppComponent } from './app.component'

const meta: Meta<AppComponent> = {
  title: 'App',
  component: AppComponent,
  tags: ['autodocs']
};

export default meta;
export const Default: Story<AppComponent> = {};