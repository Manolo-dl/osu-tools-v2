import { Component, computed, inject } from '@angular/core';
import { TASK_LABELS } from '@features/trainer';
import { TrainerTaskType } from '@features/trainer/models/trainer.model';
import { TrainerStore } from '@features/trainer/stores/trainer.store';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-trainer-task-pipeline',
  imports: [CdkDrag, CdkDropList, CdkDragHandle],
  templateUrl: './trainer-task-pipeline.component.html',
  styleUrl: './trainer-task-pipeline.component.css',
})
export class TrainerTaskPipelineComponent {

  readonly trainer = inject(TrainerStore);

  taskLabels = TASK_LABELS;
  availableTasks: TrainerTaskType[] = ['RateChange', 'Mirror', 'RemoveSV', 'NoSpinner'];

  availableTasksFiltered = computed(() => {
    const existingTypes = new Set(this.trainer.tasks().map(t => t.task.type));
    return this.availableTasks.filter(type => !existingTypes.has(type));
  });

  onDrop(event: CdkDragDrop<unknown>) {
    this.trainer.reorderTasks(event.previousIndex, event.currentIndex);
  }

  addTask(type: TrainerTaskType | '') {
    switch (type) {
      case 'RateChange':
        this.trainer.addTask({ type: 'RateChange', params: { rate: 1.0, nightcore: false } });
        break;
      case 'Mirror':
        this.trainer.addTask({ type: 'Mirror', params: { axis: 'horizontal' } });
        break;
      case 'RemoveSV':
        this.trainer.addTask({ type: 'RemoveSV', params: {} });
        break;
      case 'NoSpinner':
        this.trainer.addTask({ type: 'NoSpinner', params: {} });
        break;
    }
  }

  onRateChange(id: string, rate: number, nightcore: boolean) {
    this.trainer.updateTaskParams(id, { rate, nightcore });
  }

  onMirrorChange(id: string, axis: 'horizontal' | 'vertical') {
    this.trainer.updateTaskParams(id, { axis });
  }
}
