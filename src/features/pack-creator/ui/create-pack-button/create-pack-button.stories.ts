import { Meta } from '@storybook/angular-vite';
import { Story } from '@shared/models';
import { CreatePackButtonComponent } from './create-pack-button.component';

const meta: Meta<CreatePackButtonComponent> = {
  title: 'Features/Pack Creator/Create Pack Button',
  component: CreatePackButtonComponent,
  tags: ['autodocs'],
};

export default meta;
export const Default: Story<CreatePackButtonComponent> = {};