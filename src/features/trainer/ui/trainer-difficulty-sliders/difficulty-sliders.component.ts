import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TrainerStore } from '@features/trainer/stores/trainer.store';

@Component({
  selector: 'app-trainer-difficulty-sliders',
  imports: [DecimalPipe],
  templateUrl: './difficulty-sliders.component.html',
  styleUrl: './difficulty-sliders.component.css',
})
export class TrainerDifficultySlidersComponent {
  
  readonly trainer = inject(TrainerStore);

  onSliderChange(stat: 'hp' | 'cs' | 'ar' | 'od', event: Event) {
    const value = Number((event.target as HTMLInputElement).value);
    this.trainer.setValue(stat, value);
  }
}
