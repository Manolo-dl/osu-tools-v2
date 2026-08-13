import { Meta } from "@storybook/angular-vite";
import { CreatePacksPageComponent } from "./create-packs-page.component";
import { Story } from "@shared/models";

const meta: Meta<CreatePacksPageComponent> = {
    title: "Pages/Create Packs Page",
    component: CreatePacksPageComponent,
    tags: ["autodocs"],
};

export default meta;
export const Default: Story<CreatePacksPageComponent> = {};