import { Meta } from "@storybook/angular-vite";
import { ExportSongFolderPageComponent } from "./export-song-folder-page.component";
import { Story } from "@shared/models";

const meta: Meta<ExportSongFolderPageComponent> = {
    title: "Pages/Export Song Folder",
    component: ExportSongFolderPageComponent,
    tags: ["autodocs"],
};

export default meta;
export const Default: Story<ExportSongFolderPageComponent> = {};