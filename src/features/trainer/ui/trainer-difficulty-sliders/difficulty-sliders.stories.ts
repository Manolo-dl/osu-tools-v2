import { Meta } from '@storybook/angular-vite';
import { Story } from '@shared/models';
import { TrainerDifficultySlidersComponent } from './difficulty-sliders.component';

const meta: Meta<TrainerDifficultySlidersComponent> = {
  title: 'Features/Trainer/Trainer Difficulty Sliders',
  component: TrainerDifficultySlidersComponent,
  tags: ['autodocs'],
};

export default meta;
export const Default: Story<TrainerDifficultySlidersComponent> = {};