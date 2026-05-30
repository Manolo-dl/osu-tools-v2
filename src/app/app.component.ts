import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { HeaderComponent } from "@widgets/header"; 
import { SidebarComponent } from "@widgets/sidebar";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent {}
