import { Meta } from '@storybook/angular-vite';
import { Story } from '@shared/models';
import { PackPreviewComponent } from './pack-preview.component';

const meta: Meta<PackPreviewComponent> = {
  title: 'Features/Pack Creator/Pack Preview',
  component: PackPreviewComponent,
  tags: ['autodocs'],
};

export default meta;
export const Default: Story<PackPreviewComponent> = {};