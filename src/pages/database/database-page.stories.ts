import { Meta } from "@storybook/angular-vite";
import { DatabasePageComponent } from "./database-page.component";
import { Story } from "@shared/models";

const meta: Meta<DatabasePageComponent> = {
    title: "Pages/Database Page",
    component: DatabasePageComponent,
    tags: ["autodocs"],
};

export default meta;
export const Default: Story<DatabasePageComponent> = {};