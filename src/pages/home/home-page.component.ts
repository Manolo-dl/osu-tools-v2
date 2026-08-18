import { KeyValuePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { OsuPathStore } from '@shared/stores';
import { TuiTitle, TuiCell, TuiExpand } from "@taiga-ui/core";
import { TuiAccordionComponent, TuiAccordionDirective } from "@taiga-ui/kit";

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {
}
