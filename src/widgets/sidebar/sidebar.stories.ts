import { Meta, StoryObj } from "@storybook/angular-vite";
import { SidebarComponent } from "./sidebar.component";
import { USER_ITEMS, DEV_ITEMS } from "@entities/nav-item";

const meta: Meta<SidebarComponent> = {
    title: 'Widgets/Sidebar',
    component: SidebarComponent,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<SidebarComponent>;

export const Default: Story = {
    args: {
        userItems: USER_ITEMS,
        devItems: DEV_ITEMS,
    },
};