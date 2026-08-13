import { Meta } from "@storybook/angular-vite";
import { HomePageComponent } from "./home-page.component";
import { Story } from "@shared/models";

 const meta: Meta<HomePageComponent> = {
    title: "Pages/Home Page",
    component: HomePageComponent,
    tags: ["autodocs"],
};

export default meta;
export const Default: Story<HomePageComponent> = {};