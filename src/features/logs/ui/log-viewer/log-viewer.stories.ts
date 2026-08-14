import { Meta } from '@storybook/angular-vite';
import { Story } from '@shared/models';
import { LogViewerComponent } from './log-viewer.component';

const meta: Meta<LogViewerComponent> = {
  title: 'Features/Logs/Log Viewer',
  component: LogViewerComponent,
  tags: ['autodocs'],
};

export default meta;
export const Default: Story<LogViewerComponent> = {};