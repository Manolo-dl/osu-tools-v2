import { Meta } from '@storybook/angular-vite';
import { Story } from '@shared/models';
import { BeatmapPreviewComponent } from './beatmap-preview.component';

const meta: Meta<BeatmapPreviewComponent> = {
  title: 'Features/Export Songs/Beatmap Preview',
  component: BeatmapPreviewComponent,
  tags: ['autodocs'],
};

export default meta;
export const Default: Story<BeatmapPreviewComponent> = {};