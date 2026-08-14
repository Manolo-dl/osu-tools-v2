import { Meta } from "@storybook/angular-vite";
import { BeatmapQueueComponent } from "./beatmap-queue.component";
import { Story } from "@shared/models";

const meta: Meta<BeatmapQueueComponent> = {
    title: "Features/Beatmap Search/Beatmap Queue",
    component: BeatmapQueueComponent,
    tags: ["autodocs"],
};

export default meta;
export const Default: Story<BeatmapQueueComponent> = {};