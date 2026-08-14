import { Meta } from '@storybook/angular-vite';
import { Story } from '@shared/models';
import { TrainerActionsComponent } from './trainer-actions.component';

const meta: Meta<TrainerActionsComponent> = {
  title: 'Features/Trainer/Trainer Actions',
  component: TrainerActionsComponent,
  tags: ['autodocs'],
};

export default meta;
export const Default: Story<TrainerActionsComponent> = {};