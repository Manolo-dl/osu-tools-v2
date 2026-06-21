import { Component } from '@angular/core';
import { PackSearchInputComponent, PackBrowserComponent, PackPreviewComponent, PackDetailsFormComponent, CreatePackButtonComponent } from "@features/pack-creator";

@Component({
  selector: 'app-create-packs',
  imports: [PackSearchInputComponent, PackBrowserComponent, PackPreviewComponent, PackDetailsFormComponent, CreatePackButtonComponent],
  templateUrl: './create-packs.component.html',
  styleUrl: './create-packs.component.css',
})
export class CreatePacksComponent {}
