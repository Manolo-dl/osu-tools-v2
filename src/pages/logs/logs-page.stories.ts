import { Meta } from "@storybook/angular-vite";
import { LogsPageComponent } from "./logs-page.component";
import { Story } from "@shared/models";

const meta: Meta<LogsPageComponent> = {
    title: "Pages/Logs Page",
    component: LogsPageComponent,
    tags: ["autodocs"],
};

export default meta;
export const Default: Story<LogsPageComponent> = {};