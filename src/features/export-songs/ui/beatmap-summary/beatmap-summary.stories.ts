import { Meta } from '@storybook/angular-vite';
import { Story } from '@shared/models';
import { BeatmapSummaryComponent } from './beatmap-summary.component';

const meta: Meta<BeatmapSummaryComponent> = {
  title: 'Features/Export Songs/Beatmap Summary',
  component: BeatmapSummaryComponent,
  tags: ['autodocs'],
};

export default meta;
export const Default: Story<BeatmapSummaryComponent> = {};