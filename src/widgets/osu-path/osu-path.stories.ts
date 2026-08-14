import { applicationConfig, Meta, StoryObj } from "@storybook/angular-vite";
import { OsuPathComponent } from "./osu-path.component";
import { OsuPathStore } from "@shared/stores";

const meta: Meta<OsuPathComponent> = {
    title: 'Widgets/OsuPath',
    component: OsuPathComponent,
    tags: ['autodocs'],
    decorators: [
        applicationConfig({
            providers: [
                OsuPathStore
            ]
        })
    ]
};

export default meta;
type Story = StoryObj<OsuPathComponent>;

export const Default: Story = {};