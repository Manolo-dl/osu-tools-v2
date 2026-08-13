import { Meta } from "@storybook/angular-vite";
import { StatefulInputComponent } from "./stateful-input.component";
import { Story } from "@shared/models";

const meta: Meta<StatefulInputComponent> = {
    title: "Shared/Stateful Input",
    component: StatefulInputComponent,
    tags: ['autodocs'],
}

export default meta;
export const Default: Story<StatefulInputComponent> = {}