import { Meta } from '@storybook/angular-vite';
import { ImportFileDropzoneComponent } from './import-file-dropzone.component';
import { Story } from '@shared/models';

const meta: Meta<ImportFileDropzoneComponent> = {
  title: 'Features/Collection Importer/Import File Dropzone',
  component: ImportFileDropzoneComponent,
  tags: ['autodocs'],
};

export default meta;
export const Default: Story<ImportFileDropzoneComponent> = {};