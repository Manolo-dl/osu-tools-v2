import { Meta, StoryObj } from "@storybook/angular-vite";
import { BeatmapSetCardComponent } from "./beatmap-set-card.component";
import { Story } from "@shared/models";

const meta: Meta<BeatmapSetCardComponent> = {
    title: 'Shared/Beatmap Set Card',
    component: BeatmapSetCardComponent,
    tags: ['autodocs'],
};

export default meta;
export const Default: Story<BeatmapSetCardComponent> = {}