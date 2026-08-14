import { Meta } from '@storybook/angular-vite';
import { Story } from '@shared/models';
import { TrainerTaskPipelineComponent } from './trainer-task-pipeline.component';

const meta: Meta<TrainerTaskPipelineComponent> = {
  title: 'Features/Trainer/Trainer Task Pipeline',
  component: TrainerTaskPipelineComponent,
  tags: ['autodocs'],
};

export default meta;
export const Default: Story<TrainerTaskPipelineComponent> = {};