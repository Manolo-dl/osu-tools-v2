import { Meta } from '@storybook/angular-vite';
import { Story } from '@shared/models';
import { DatabaseTableListComponent } from './database-table-list.component';

const meta: Meta<DatabaseTableListComponent> = {
  title: 'Features/Database/Database Table List',
  component: DatabaseTableListComponent,
  tags: ['autodocs'],
};

export default meta;
export const Default: Story<DatabaseTableListComponent> = {};