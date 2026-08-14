import { applicationConfig, Meta, StoryObj } from "@storybook/angular-vite";
import { ToastComponent } from "./toast.component";
import { ToastStore } from "@shared/stores";
import { provideIcons } from "@ng-icons/core";
import { phosphorCheckCircle, phosphorInfo, phosphorWarningCircle, phosphorXCircle } from "@ng-icons/phosphor-icons/regular";
import { Story } from "@shared/models";

const meta: Meta<ToastComponent> = {
    title: 'Widgets/Toast',
    component: ToastComponent,
    tags: ['autodocs'],
    decorators: [
        applicationConfig({
            providers: [
                ToastStore,
                provideIcons({
                    phosphorCheckCircle,
                    phosphorXCircle,
                    phosphorWarningCircle,
                    phosphorInfo
                })
            ]
        }),
    ],
};

export default meta;

export const Default: Story<ToastComponent> = {}