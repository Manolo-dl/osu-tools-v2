import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { HeaderComponent } from "@widgets/header"; 
import { SidebarComponent } from "@widgets/sidebar";
import { OsuPathComponent } from "@widgets/osu-path"; 

@Component({
  selector: "app-root",
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, OsuPathComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent {}
