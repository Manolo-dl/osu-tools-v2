import { applicationConfig, Meta, StoryObj } from "@storybook/angular-vite";
import { SidebarComponent } from "./sidebar.component";
import { USER_ITEMS, DEV_ITEMS } from "@entities/nav-item";
import { provideIcons } from "@ng-icons/core";
import { provideRouter } from "@angular/router";
import { 
  phosphorHouse, 
  phosphorDownloadSimple, 
  phosphorFolder, 
  phosphorMusicNote, 
  phosphorTarget 
} from "@ng-icons/phosphor-icons/regular";

const meta: Meta<SidebarComponent> = {
    title: 'Widgets/Sidebar',
    component: SidebarComponent,
    tags: ['autodocs'],
    decorators: [
        applicationConfig({
            providers: [
                provideRouter([]),
                provideIcons({ 
                    phosphorHouse, 
                    phosphorDownloadSimple, 
                    phosphorFolder, 
                    phosphorMusicNote, 
                    phosphorTarget 
                }),
            ]
        }),
    ],
};

export default meta;
type Story = StoryObj<SidebarComponent>;

export const Default: Story = {
    args: {
        userItems: USER_ITEMS,
        devItems: DEV_ITEMS,
    },
};