import { Meta } from "@storybook/angular-vite";
import { TrainerPageComponent } from "./trainer-page.component";
import { Story } from "@shared/models";

const meta: Meta<TrainerPageComponent> = {
    title: "Pages/Trainer Page",
    component: TrainerPageComponent,
    tags: ["autodocs"],
};

export default meta;
export const Default: Story<TrainerPageComponent> = {};