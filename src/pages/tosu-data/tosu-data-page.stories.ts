import { Meta } from "@storybook/angular-vite";
import { TosuDataPage } from "./tosu-data-page.component";
import { Story } from "@shared/models";

const meta: Meta<TosuDataPage> = {
    title: "Pages/Tosu Data",
    component: TosuDataPage,
    tags: ["autodocs"],
};

export default meta;
export const Default: Story<TosuDataPage> = {};