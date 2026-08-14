import { Meta } from '@storybook/angular-vite';
import { ImportPreviewComponent } from './import-preview.component';
import { Story } from '@shared/models';

const meta: Meta<ImportPreviewComponent> = {
  title: 'Features/Collection Importer/Import Preview',
  component: ImportPreviewComponent,
  tags: ['autodocs'],
};

export default meta;
export const Default: Story<ImportPreviewComponent> = {};