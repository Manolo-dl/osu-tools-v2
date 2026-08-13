import { applicationConfig, Meta } from "@storybook/angular-vite";
import { DownloaderPageComponent } from "./downloader-page.component";
import { Story } from "@shared/models";

const meta: Meta<DownloaderPageComponent> = {
    title: "Pages/Downloader",
    component: DownloaderPageComponent,
    tags: ["autodocs"],
};

export default meta;
export const Default: Story<DownloaderPageComponent> = {}