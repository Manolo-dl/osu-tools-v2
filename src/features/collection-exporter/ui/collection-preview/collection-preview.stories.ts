import { Meta } from "@storybook/angular-vite";
import { CollectionPreviewComponent } from "./collection-preview.component";
import { Story } from "@shared/models";

const meta: Meta<CollectionPreviewComponent> = { 
    title: "Features/Collection Exporter/Collection Preview",
    component: CollectionPreviewComponent,
    tags: ["autodocs"],
};

export default meta;
export const Default: Story<CollectionPreviewComponent> = {};