import { Meta } from "@storybook/angular-vite";
import { CollectionSummaryComponent } from "./collection-summary.component";
import { Story } from "@shared/models";

const meta: Meta<CollectionSummaryComponent> = {
    title: "Features/Collection Exporter/Collection Summary",
    component: CollectionSummaryComponent,
    tags: ["autodocs"],
};

export default meta;
export const Default: Story<CollectionSummaryComponent> = {};