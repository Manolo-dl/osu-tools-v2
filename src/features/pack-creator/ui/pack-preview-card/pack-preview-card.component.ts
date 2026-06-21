import { Component, effect, inject, input, signal } from '@angular/core';
import { form, required, FormField, validate } from '@angular/forms/signals';
import { PackStore, SelectedDiff } from '@entities/pack';
import { StatefulInputComponent } from "@shared/ui";

@Component({
  selector: 'app-pack-preview-card',
  imports: [FormField, StatefulInputComponent],
  templateUrl: './pack-preview-card.component.html',
  styleUrl: './pack-preview-card.component.css',
})
export class PackPreviewCardComponent {

  readonly diff = input.required<SelectedDiff>();
  readonly store = inject(PackStore);

  private readonly model = signal({ newDiffName: '' });
  readonly nameForm = form(
    this.model,
    (schemaPath) => {
      required(schemaPath.newDiffName, { message: 'Difficulty name is required' });

      validate(schemaPath.newDiffName, ({ value }) => {
        const currentMd5 = this.diff().md5;
        const duplicate = this.store.selectedDiffs().some(
          d => d.md5 !== currentMd5 && d.newDiffName === value()
        );

        if (duplicate) {
          return { kind: 'duplicatedName', message: 'Difficulty name must be unique' };
        }

        return null;
      });
    }
  );

  constructor() {
    effect(() => {
      this.model.set({ newDiffName: this.diff().newDiffName});
    });

    effect(() => {
      if (this.nameForm.newDiffName().touched() && this.nameForm.newDiffName().valid()) {
        this.store.updateDiffName(this.diff(), this.nameForm.newDiffName().value());
      }
    })
  }

  onRemove() {
    this.store.toggleDiff(this.diff());
  }
}
