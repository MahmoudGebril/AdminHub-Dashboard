import { Injectable, signal } from '@angular/core';
import { Toast, ToastType } from '../../models/api.model';
import { generateId } from '../../utils/id.util';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly toasts = signal<Toast[]>([]);

  show(message: string, type: ToastType = 'info', duration = 4000): void {
    const toast: Toast = { id: generateId(), type, message, duration };
    this.toasts.update((t) => [...t, toast]);
    if (duration > 0) {
      setTimeout(() => this.dismiss(toast.id), duration);
    }
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error', 6000);
  }

  warning(message: string): void {
    this.show(message, 'warning');
  }

  info(message: string): void {
    this.show(message, 'info');
  }

  dismiss(id: string): void {
    this.toasts.update((t) => t.filter((x) => x.id !== id));
  }
}
