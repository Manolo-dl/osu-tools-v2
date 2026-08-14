import { Meta } from "@storybook/angular-vite";
import { BeatmapSetListComponent } from "./beatmap-set-list.component";
import { Story } from "@shared/models";

const meta: Meta<BeatmapSetListComponent> = {
    title: "Shared/Beatmap Set List",
    component: BeatmapSetListComponent,
    tags: ['autodocs'],
}

export default meta;
export const Default: Story<BeatmapSetListComponent> = {}