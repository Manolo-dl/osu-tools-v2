import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { OsuPathService } from '@shared/services';

@Component({
  selector: 'app-osu-path',
  imports: [],
  templateUrl: './osu-path.component.html',
  styleUrl: './osu-path.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OsuPathComponent implements OnInit {

  osuPath = inject(OsuPathService);

  ngOnInit(): void {
    this.osuPath.detect();
  }

  async selectManually() {
    await this.osuPath.selectManually();
  }
}
