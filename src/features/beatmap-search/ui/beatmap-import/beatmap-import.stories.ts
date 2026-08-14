import { Meta } from "@storybook/angular-vite";
import { BeatmapImportComponent } from "./beatmap-import.component";
import { Story } from "@shared/models";

const meta: Meta<BeatmapImportComponent> =  {
    title: "Features/Beatmap Search/Beatmap Import",
    component: BeatmapImportComponent,
    tags: ["autodocs"],
};

export default meta;
export const Default: Story<BeatmapImportComponent> = {};