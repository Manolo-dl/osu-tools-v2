import { Meta } from "@storybook/angular-vite";
import { ExportCollectionsPageComponent } from "./export-collections-page.component";
import { Story } from "@shared/models";

const meta: Meta<ExportCollectionsPageComponent> = {
    title: "Pages/Export Collections",
    component: ExportCollectionsPageComponent,
    tags: ["autodocs"],
};

export default meta;
export const Default: Story<ExportCollectionsPageComponent> = {};