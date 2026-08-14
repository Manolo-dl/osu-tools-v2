import { Meta } from "@storybook/angular-vite";
import { ExportControlsComponent } from "./export-controls.component";
import { Story } from "@shared/models";

const meta: Meta<ExportControlsComponent> = {
    title: "Shared/Export Controls",
    component: ExportControlsComponent,
    tags: ['autodocs'],
}

export default meta;
export const Default: Story<ExportControlsComponent> = {}