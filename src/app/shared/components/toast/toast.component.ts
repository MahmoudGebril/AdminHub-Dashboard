import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toast-container" aria-live="polite" aria-atomic="false">
      @for (toast of notify.toasts(); track toast.id) {
        <div class="toast" [ngClass]="'toast--' + toast.type" role="alert">
          <span class="toast-icon">{{ icons[toast.type] }}</span>
          <span class="toast-message">{{ toast.message }}</span>
          <button class="toast-close" (click)="notify.dismiss(toast.id)" aria-label="Dismiss">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: var(--z-toast);
      max-width: 380px;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      border-radius: var(--radius-lg);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-lg);
      animation: slideIn var(--transition-base) ease;
      min-width: 280px;

      &--success { border-left: 4px solid var(--color-success); }
      &--error   { border-left: 4px solid var(--color-error); }
      &--warning { border-left: 4px solid var(--color-warning); }
      &--info    { border-left: 4px solid var(--color-info); }
    }

    .toast-icon { font-size: 16px; flex-shrink: 0; }

    .toast-message {
      flex: 1;
      font-size: var(--font-size-sm);
      color: var(--color-text);
      line-height: 1.4;
    }

    .toast-close {
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      color: var(--color-text-muted);
      cursor: pointer;
      padding: 2px;
      border-radius: var(--radius-sm);
      transition: color var(--transition-fast);
      flex-shrink: 0;
      &:hover { color: var(--color-text); }
    }

    @keyframes slideIn {
      from { transform: translateX(20px); opacity: 0; }
      to   { transform: translateX(0);    opacity: 1; }
    }
  `],
})
export class ToastComponent {
  readonly notify = inject(NotificationService);

  readonly icons: Record<string, string> = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };
}
