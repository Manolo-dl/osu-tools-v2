import { Meta } from "@storybook/angular-vite";
import { ImportConfirmButtonComponent } from "./import-confirm-button.component";
import { Story } from "@shared/models";

const meta: Meta<ImportConfirmButtonComponent> = {
    title: "Features/Collection Importer/Import Confirm Button",
    component: ImportConfirmButtonComponent,
    tags: ["autodocs"],
};

export default meta;
export const Default: Story<ImportConfirmButtonComponent> = {};