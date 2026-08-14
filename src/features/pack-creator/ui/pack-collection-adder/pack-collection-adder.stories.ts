import { Meta } from '@storybook/angular-vite';
import { Story } from '@shared/models';
import { PackCollectionAdderComponent } from './pack-collection-adder.component';

const meta: Meta<PackCollectionAdderComponent> = {
  title: 'Features/Pack Creator/Pack Collection Adder',
  component: PackCollectionAdderComponent,
  tags: ['autodocs'],
};

export default meta;
export const Default: Story<PackCollectionAdderComponent> = {};