import { Meta } from '@storybook/angular-vite';
import { Story } from '@shared/models';
import { PackBrowserCardComponent } from './pack-browser-card.component';

const meta: Meta<PackBrowserCardComponent> = {
  title: 'Features/Pack Creator/Pack Browser Card',
  component: PackBrowserCardComponent,
  tags: ['autodocs'],
};

export default meta;
export const Default: Story<PackBrowserCardComponent> = {};