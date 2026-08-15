import { TuiRoot } from "@taiga-ui/core";
import { Component, inject, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { HeaderComponent } from "@widgets/header";
import { SidebarComponent } from "@widgets/sidebar";
import { OsuPathComponent } from "@widgets/osu-path";
import { ToastComponent } from "@widgets/toast";
import { ThemeService } from "@shared/services";
import { PlatformStore } from "@shared/stores";
import { WindowControlsComponent } from "@widgets/window-controls/window-controls.component";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, OsuPathComponent, ToastComponent, TuiRoot, WindowControlsComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent implements OnInit {
  // inject early so the effect applies data-theme before first render
  themeService = inject(ThemeService);
  platformStore = inject(PlatformStore);

  ngOnInit() {
    this.platformStore.setOs();
  }
}
