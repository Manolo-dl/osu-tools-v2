import { Component, inject, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { HeaderComponent } from "@widgets/header"; 
import { SidebarComponent } from "@widgets/sidebar";
import { OsuPathComponent } from "@widgets/osu-path"; 
import { AuthService } from "@shared/services";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, OsuPathComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent implements OnInit {
  authService = inject(AuthService);

  ngOnInit() {
    this.authService.loadPersistedUser();
  }
}