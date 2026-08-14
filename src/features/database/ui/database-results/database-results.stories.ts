import { Meta } from '@storybook/angular-vite';
import { Story } from '@shared/models';
import { DatabaseResultsComponent } from './database-results.component';

const meta: Meta<DatabaseResultsComponent> = {
  title: 'Features/Database/Database Results',
  component: DatabaseResultsComponent,
  tags: ['autodocs'],
};

export default meta;
export const Default: Story<DatabaseResultsComponent> = {};