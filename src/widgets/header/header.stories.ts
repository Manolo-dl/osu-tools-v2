import { applicationConfig, StoryObj, type Meta } from "@storybook/angular-vite";
import { HeaderComponent } from "./header.component";
import { ThemeService } from "@shared/services";
import { NavStore } from "@entities/nav-item";
import { provideIcons } from "@ng-icons/core";
import { phosphorDesktop, phosphorMoon, phosphorSun } from "@ng-icons/phosphor-icons/regular";

const meta: Meta<HeaderComponent> = {
    title: 'Widgets/Header',
    component: HeaderComponent,
    tags: ['autodocs'],
    decorators: [
        applicationConfig({
            providers: [
                ThemeService,
                NavStore,
                provideIcons({ phosphorSun, phosphorMoon, phosphorDesktop }),
            ]
        }),
    ],
};

export default meta;
type Story = StoryObj<HeaderComponent>;

export const Default: Story = {};