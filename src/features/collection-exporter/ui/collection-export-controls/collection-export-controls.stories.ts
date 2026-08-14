import { Meta } from "@storybook/angular-vite";
import { CollectionExportControlsComponent } from "./collection-export-controls.component";
import { Story } from "@shared/models";

const meta: Meta<CollectionExportControlsComponent> = {
    title: "Features/Collection Exporter/Collection Export Controls",
    component: CollectionExportControlsComponent,
    tags: ["autodocs"],
};

export default meta;
export const Default: Story<CollectionExportControlsComponent> = {};