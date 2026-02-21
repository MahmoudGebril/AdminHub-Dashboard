import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  OnInit,
  OnDestroy,
} from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="modal-overlay" (click)="onOverlayClick($event)">
      <div class="modal-container" [class]="'modal--' + size()" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h2 class="modal-title">{{ title() }}</h2>
          <button class="modal-close" (click)="closed.emit()" aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <ng-content />
        </div>
        @if (hasFooter()) {
          <div class="modal-footer">
            <ng-content select="[modal-footer]" />
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(2px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: var(--z-modal);
      padding: var(--space-4);
      animation: fadeIn var(--transition-fast) ease;
    }

    .modal-container {
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-xl);
      width: 100%;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      animation: slideUp var(--transition-base) ease;

      &.modal--sm { max-width: 400px; }
      &.modal--md { max-width: 560px; }
      &.modal--lg { max-width: 720px; }
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-5) var(--space-6);
      border-bottom: 1px solid var(--color-border);
      flex-shrink: 0;
    }

    .modal-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text);
      margin: 0;
    }

    .modal-close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      color: var(--color-text-muted);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover { background: var(--color-border); color: var(--color-text); }
    }

    .modal-body {
      padding: var(--space-6);
      overflow-y: auto;
      flex: 1;
    }

    .modal-footer {
      padding: var(--space-4) var(--space-6);
      border-top: 1px solid var(--color-border);
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      flex-shrink: 0;
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `],
})
export class ModalComponent implements OnInit, OnDestroy {
  readonly title = input('');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly hasFooter = input(true);
  readonly closeOnOverlay = input(true);

  readonly closed = output<void>();

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', this.handleEsc);
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
    document.removeEventListener('keydown', this.handleEsc);
  }

  private readonly handleEsc = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') this.closed.emit();
  };

  onOverlayClick(e: MouseEvent): void {
    if (this.closeOnOverlay() && e.target === e.currentTarget) {
      this.closed.emit();
    }
  }
}
