import { Meta } from '@storybook/angular-vite';
import { Story } from '@shared/models';
import { PackBrowserComponent } from './pack-browser.component';

const meta: Meta<PackBrowserComponent> = {
  title: 'Features/Pack Creator/Pack Browser',
  component: PackBrowserComponent,
  tags: ['autodocs'],
};

export default meta;
export const Default: Story<PackBrowserComponent> = {};