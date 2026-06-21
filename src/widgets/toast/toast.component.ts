import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorCheckCircle,
  phosphorXCircle,
  phosphorWarningCircle,
  phosphorInfo,
  phosphorX,
} from '@ng-icons/phosphor-icons/regular';
import { ToastStore } from '@shared/stores';

const TOAST_ICON: Record<string, string> = {
  success: 'phosphorCheckCircle',
  error:   'phosphorXCircle',
  warning: 'phosphorWarningCircle',
  info:    'phosphorInfo',
};

@Component({
  selector: 'app-toast',
  imports: [NgClass, NgIcon],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css',
  providers: [provideIcons({ phosphorCheckCircle, phosphorXCircle, phosphorWarningCircle, phosphorInfo, phosphorX })],
})
export class ToastComponent {
  readonly store = inject(ToastStore);
  readonly toastIcon = TOAST_ICON;
}
