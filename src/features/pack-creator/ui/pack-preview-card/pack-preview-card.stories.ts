import { Meta } from '@storybook/angular-vite';
import { Story } from '@shared/models';
import { PackPreviewCardComponent } from './pack-preview-card.component';

const meta: Meta<PackPreviewCardComponent> = {
  title: 'Features/Pack Creator/Pack Preview Card',
  component: PackPreviewCardComponent,
  tags: ['autodocs'],
};

export default meta;
export const Default: Story<PackPreviewCardComponent> = {};