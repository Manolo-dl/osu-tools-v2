import { Component, inject, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { HeaderComponent } from "@widgets/header"; 
import { SidebarComponent } from "@widgets/sidebar";
import { OsuPathComponent } from "@widgets/osu-path"; 
import { AuthService, ThemeService } from "@shared/services";
import { PlatformStore } from "@shared/stores";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, OsuPathComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent implements OnInit {
  authService = inject(AuthService);
  // inject early so the effect applies data-theme before first render
  themeService = inject(ThemeService);
  platformStore = inject(PlatformStore);

  ngOnInit() {
    this.authService.loadPersistedUser();
    this.platformStore.setOs();
  }
}