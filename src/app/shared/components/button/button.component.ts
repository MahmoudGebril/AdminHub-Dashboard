import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { NgClass } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [ngClass]="classes"
      (click)="clicked.emit($event)"
    >
      @if (loading()) {
        <span class="btn-spinner"></span>
      }
      <ng-content />
    </button>
  `,
  styles: [`
    :host { display: contents; }

    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-family: var(--font-family);
      font-weight: var(--font-weight-medium);
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);
      white-space: nowrap;
      user-select: none;
      line-height: 1;

      &:disabled { opacity: 0.5; cursor: not-allowed; }
      &:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
    }

    .btn-sm { padding: 6px 12px; font-size: var(--font-size-xs); }
    .btn-md { padding: 9px 16px; font-size: var(--font-size-sm); }
    .btn-lg { padding: 12px 20px; font-size: var(--font-size-base); }

    .btn-primary {
      background: var(--color-primary);
      color: var(--color-text-inverse);
      &:not(:disabled):hover { background: var(--color-primary-hover); }
    }

    .btn-secondary {
      background: var(--color-surface);
      color: var(--color-text);
      border: 1px solid var(--color-border);
      &:not(:disabled):hover { background: var(--color-bg); border-color: var(--color-border-strong); }
    }

    .btn-danger {
      background: var(--color-error);
      color: #fff;
      &:not(:disabled):hover { background: #b91c1c; }
    }

    .btn-ghost {
      background: transparent;
      color: var(--color-text-muted);
      &:not(:disabled):hover { background: var(--color-border); color: var(--color-text); }
    }

    .btn-outline {
      background: transparent;
      color: var(--color-primary);
      border: 1px solid var(--color-primary);
      &:not(:disabled):hover { background: var(--color-primary-light); }
    }

    .btn-spinner {
      width: 14px;
      height: 14px;
      border: 2px solid currentColor;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly fullWidth = input(false);

  readonly clicked = output<MouseEvent>();

  get classes(): Record<string, boolean> {
    return {
      [`btn-${this.variant()}`]: true,
      [`btn-${this.size()}`]: true,
      'w-full': this.fullWidth(),
    };
  }
}
