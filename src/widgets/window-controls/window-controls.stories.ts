import { Meta } from '@storybook/angular-vite';
import { Story } from '@shared/models';
import { WindowControlsComponent } from './window-controls.component';

const meta: Meta<WindowControlsComponent> = {
  title: 'Widgets/Window Controls',
  component: WindowControlsComponent,
  tags: ['autodocs'],
};

export default meta;
export const Default: Story<WindowControlsComponent> = {};