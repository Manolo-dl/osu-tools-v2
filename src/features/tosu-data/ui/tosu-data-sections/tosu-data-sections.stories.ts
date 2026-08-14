import { Meta } from '@storybook/angular-vite';
import { Story } from '@shared/models';
import { TosuDataSectionsComponent } from './tosu-data-sections.component';

const meta: Meta<TosuDataSectionsComponent> = {
  title: 'Features/Tosu Data/Tosu Data Sections',
  component: TosuDataSectionsComponent,
  tags: ['autodocs'],
};

export default meta;
export const Default: Story<TosuDataSectionsComponent> = {};