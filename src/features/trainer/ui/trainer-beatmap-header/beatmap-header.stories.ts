import { Meta } from '@storybook/angular-vite';
import { Story } from '@shared/models';
import { TrainerBeatmapHeaderComponent } from './beatmap-header.component';

const meta: Meta<TrainerBeatmapHeaderComponent> = {
  title: 'Features/Trainer/Trainer Beatmap Header',
  component: TrainerBeatmapHeaderComponent,
  tags: ['autodocs'],
};

export default meta;
export const Default: Story<TrainerBeatmapHeaderComponent> = {};