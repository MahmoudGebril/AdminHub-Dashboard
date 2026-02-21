import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="spinner-wrapper" [class]="'spinner--' + size()">
      <div class="spinner"></div>
    </div>
  `,
  styles: [`
    .spinner-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .spinner {
      border-radius: 50%;
      border: 2px solid var(--color-border);
      border-top-color: var(--color-primary);
      animation: spin 0.7s linear infinite;
    }

    .spinner--sm .spinner { width: 16px; height: 16px; }
    .spinner--md .spinner { width: 28px; height: 28px; border-width: 3px; }
    .spinner--lg .spinner { width: 44px; height: 44px; border-width: 4px; }

    .spinner--overlay {
      position: fixed;
      inset: 0;
      background: rgba(255,255,255,0.6);
      z-index: 9999;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class SpinnerComponent {
  readonly size = input<'sm' | 'md' | 'lg'>('md');
}
