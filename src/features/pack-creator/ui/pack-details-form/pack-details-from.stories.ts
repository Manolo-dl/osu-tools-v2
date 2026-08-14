import { Meta } from '@storybook/angular-vite';
import { Story } from '@shared/models';
import { PackDetailsFormComponent } from './pack-details-form.component';

const meta: Meta<PackDetailsFormComponent> = {
  title: 'Features/Pack Creator/Pack Details Form',
  component: PackDetailsFormComponent,
  tags: ['autodocs'],
};

export default meta;
export const Default: Story<PackDetailsFormComponent> = {};