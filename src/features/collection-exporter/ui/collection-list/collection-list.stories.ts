import { Meta } from "@storybook/angular-vite";
import { CollectionListComponent } from "./collection-list.component";
import { Story } from "@shared/models";

const meta: Meta<CollectionListComponent> = {
    title: "Features/Collection Exporter/Collection List",
    component: CollectionListComponent,
    tags: ["autodocs"],
};

export default meta;
export const Default: Story<CollectionListComponent> = {};