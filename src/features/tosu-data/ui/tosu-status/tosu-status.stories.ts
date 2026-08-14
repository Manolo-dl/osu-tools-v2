import { Meta } from '@storybook/angular-vite';
import { Story } from '@shared/models';
import { TosuStatusComponent } from './tosu-status.component';

const meta: Meta<TosuStatusComponent> = {
  title: 'Features/Tosu Data/Tosu Status',
  component: TosuStatusComponent,
  tags: ['autodocs'],
};

export default meta;
export const Default: Story<TosuStatusComponent> = {};