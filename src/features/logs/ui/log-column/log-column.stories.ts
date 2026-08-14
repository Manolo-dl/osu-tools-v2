import { Meta } from '@storybook/angular-vite';
import { Story } from '@shared/models';
import { LogColumnComponent } from './log-column.component';

const meta: Meta<LogColumnComponent> = {
  title: 'Features/Logs/Log Column',
  component: LogColumnComponent,
  tags: ['autodocs'],
};

export default meta;
export const Default: Story<LogColumnComponent> = {};