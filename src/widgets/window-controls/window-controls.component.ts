import { Component } from '@angular/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faMinimize, faMaximize, faXmark } from '@fortawesome/free-solid-svg-icons';
import { TuiButton } from '@taiga-ui/core';

@Component({
  selector: 'app-window-controls',
  imports: [FaIconComponent, TuiButton],
  templateUrl: './window-controls.component.html',
  styleUrl: './window-controls.component.css',
})
export class WindowControlsComponent {

  readonly window = getCurrentWindow();

  readonly icons = {
    faMinimize,
    faMaximize,
    faXmark,
  }
}
