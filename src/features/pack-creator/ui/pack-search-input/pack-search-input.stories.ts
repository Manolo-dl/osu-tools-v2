import { Meta } from '@storybook/angular-vite';
import { Story } from '@shared/models';
import { PackSearchInputComponent } from './pack-search-input.component';

const meta: Meta<PackSearchInputComponent> = {
  title: 'Features/Pack Creator/Pack Search Input',
  component: PackSearchInputComponent,
  tags: ['autodocs'],
};

export default meta;
export const Default: Story<PackSearchInputComponent> = {};