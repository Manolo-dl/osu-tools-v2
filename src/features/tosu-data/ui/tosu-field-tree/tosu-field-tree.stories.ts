import { Meta } from '@storybook/angular-vite';
import { Story } from '@shared/models';
import { TosuFieldTreeComponent } from './tosu-field-tree.component';

const meta: Meta<TosuFieldTreeComponent> = {
  title: 'Features/Tosu Data/Tosu Field Tree',
  component: TosuFieldTreeComponent,
  tags: ['autodocs'],
};

export default meta;
export const Default: Story<TosuFieldTreeComponent> = {};