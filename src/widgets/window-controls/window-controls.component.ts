import { Component } from '@angular/core';
import { getCurrentWindow } from '@tauri-apps/api/window';

@Component({
  selector: 'app-window-controls',
  imports: [],
  templateUrl: './window-controls.component.html',
  styleUrl: './window-controls.component.css',
})
export class WindowControlsComponent {

  readonly window = getCurrentWindow();
}
