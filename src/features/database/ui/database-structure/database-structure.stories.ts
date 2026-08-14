import { Meta } from '@storybook/angular-vite';
import { Story } from '@shared/models';
import { DatabaseStructureComponent } from './database-structure.component';

const meta: Meta<DatabaseStructureComponent> = {
  title: 'Features/Database/Database Structure',
  component: DatabaseStructureComponent,
  tags: ['autodocs'],
};

export default meta;
export const Default: Story<DatabaseStructureComponent> = {};