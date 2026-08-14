import { Meta } from '@storybook/angular-vite';
import { Story } from '@shared/models';
import { BeatmapExportControlsComponent } from './beatmap-export-controls.component';

const meta: Meta<BeatmapExportControlsComponent> = {
  title: 'Features/Export Songs/Beatmap Export Controls',
  component: BeatmapExportControlsComponent,
  tags: ['autodocs'],
};

export default meta;
export const Default: Story<BeatmapExportControlsComponent> = {};