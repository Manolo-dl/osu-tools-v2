import { Meta } from "@storybook/angular-vite";
import { ImportCollectionsPageComponent } from "./import-collections-page.component";
import { Story } from "@shared/models";

const meta: Meta<ImportCollectionsPageComponent> = {
    title: "Pages/Import Collections",
    component: ImportCollectionsPageComponent,
    tags: ["autodocs"],
};

export default meta;
export const Default: Story<ImportCollectionsPageComponent> = {};