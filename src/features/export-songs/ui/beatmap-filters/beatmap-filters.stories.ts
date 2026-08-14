import { Meta } from '@storybook/angular-vite';
import { Story } from '@shared/models';
import { BeatmapFiltersComponent } from './beatmap-filters.component';

const meta: Meta<BeatmapFiltersComponent> = {
  title: 'Features/Export Songs/Beatmap Filters',
  component: BeatmapFiltersComponent,
  tags: ['autodocs'],
};

export default meta;
export const Default: Story<BeatmapFiltersComponent> = {};