import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BeatmapImportComponent, BeatmapQueueComponent } from "@features/beatmap-search";
import { OsuCookieInputComponent } from '@features/downloader';
import { OsuDbStore } from '@entities/osu-db';
import { TuiTitle, TuiNotificationDirective, TuiButton } from "@taiga-ui/core";
import { TuiAccordion } from '@taiga-ui/kit';

interface PageInfo {
  title: string,
  steps: Step[]
}

interface Step {
  desc: string,
  image?: string
}

@Component({
  selector: 'app-downloader',
  imports: [BeatmapImportComponent, BeatmapQueueComponent, OsuCookieInputComponent, TuiTitle, TuiNotificationDirective, TuiButton, TuiAccordion],
  templateUrl: './downloader-page.component.html',
  styleUrl: './downloader-page.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloaderPageComponent {
  readonly osuDb = inject(OsuDbStore);

  async loadLibrary() {
    await this.osuDb.load();
  }

  readonly downloaderInfo: PageInfo[] = [
    {
      title: 'How to use the downloader',
      steps: [
        {
          desc: 'Get the osu session cookie (check how to get osu session step)'
        },
        {
          desc: 'Put the osu session in the input'
        },
        {
          desc: 'Drop or select a txt file containing all download links (check file format step)'
        },
        {
          desc: 'In the queue there will be a list with all the map IDs click start'
        }
      ]
    },
    {
      title: 'How to get osu session',
      steps: [
        {
          desc: 'Go to your browser',
        },
        {
          desc: 'Go to the osu page, make sure you are logged'
        },
        {
          desc: 'Right click and choose inspect',
          image: 'assets/images/downloader/step_3.png'
        },
        {
          desc: 'Go to Application or Storage tab',
          image: 'assets/images/downloader/step_4.png'
        },
        {
          desc: 'Go to cookies -> https://osu.ppy.sh and copy the value of the cookie with the name of osu_session',
          image: 'assets/images/downloader/step_5.png',
        }
      ]
    }
  ]
}
