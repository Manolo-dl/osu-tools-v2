import { Component } from '@angular/core';
import { PackSearchInputComponent, PackBrowserComponent, PackPreviewComponent, PackDetailsFormComponent, CreatePackButtonComponent } from "@features/pack-creator";

@Component({
  selector: 'app-create-packs',
  imports: [PackSearchInputComponent, PackBrowserComponent, PackPreviewComponent, PackDetailsFormComponent, CreatePackButtonComponent],
  templateUrl: './create-packs-page.component.html',
  styleUrl: './create-packs-page.component.css',
})
export class CreatePacksPageComponent {}
