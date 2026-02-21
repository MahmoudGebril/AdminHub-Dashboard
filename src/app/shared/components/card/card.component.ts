import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card" [class.card--flat]="flat()">
      @if (title()) {
        <div class="card__header">
          <h3 class="card__title">{{ title() }}</h3>
          <ng-content select="[card-actions]" />
        </div>
      }
      <div class="card__body">
        <ng-content />
      </div>
    </div>
  `,
  styles: [`
    .card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      overflow: hidden;

      &--flat {
        box-shadow: none;
      }
    }

    .card__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-5) var(--space-6);
      border-bottom: 1px solid var(--color-border);
    }

    .card__title {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text);
      margin: 0;
    }

    .card__body {
      padding: var(--space-6);
    }
  `],
})
export class CardComponent {
  readonly title = input('');
  readonly flat = input(false);
}
