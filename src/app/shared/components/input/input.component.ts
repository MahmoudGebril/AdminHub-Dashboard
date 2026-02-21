import {
  Component,
  ChangeDetectionStrategy,
  input,
  forwardRef,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [NgClass, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="input-wrapper">
      @if (label()) {
        <label class="input-label" [for]="inputId()">{{ label() }}</label>
      }
      <div class="input-field" [class.input-field--error]="error()">
        @if (prefixIcon()) {
          <span class="input-icon input-icon--prefix">
            <ng-content select="[prefix]" />
          </span>
        }
        <input
          [id]="inputId()"
          [type]="type()"
          [placeholder]="placeholder()"
          [disabled]="isDisabled()"
          [value]="value()"
          [ngClass]="{ 'has-prefix': prefixIcon() }"
          (input)="onInput($event)"
          (blur)="onTouched()"
        />
      </div>
      @if (error()) {
        <span class="input-error">{{ error() }}</span>
      }
      @if (hint() && !error()) {
        <span class="input-hint">{{ hint() }}</span>
      }
    </div>
  `,
  styles: [`
    .input-wrapper {
      display: flex;
      flex-direction: column;
      gap: 4px;
      width: 100%;
    }

    .input-label {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-text);
    }

    .input-field {
      position: relative;
      display: flex;
      align-items: center;

      input {
        width: 100%;
        padding: 9px 14px;
        font-size: var(--font-size-base);
        color: var(--color-text);
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        outline: none;
        transition: border-color var(--transition-fast), box-shadow var(--transition-fast);

        &::placeholder { color: var(--color-text-subtle); }
        &:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }
        &:disabled { opacity: 0.6; cursor: not-allowed; background: var(--color-bg); }
        &.has-prefix { padding-left: 36px; }
      }

      &--error input {
        border-color: var(--color-error);
        &:focus { box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1); }
      }
    }

    .input-icon {
      position: absolute;
      left: 10px;
      color: var(--color-text-muted);
      display: flex;
      align-items: center;
      pointer-events: none;
    }

    .input-error {
      font-size: var(--font-size-xs);
      color: var(--color-error);
    }

    .input-hint {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }
  `],
})
export class InputComponent implements ControlValueAccessor {
  readonly label = input('');
  readonly type = input<string>('text');
  readonly placeholder = input('');
  readonly error = input('');
  readonly hint = input('');
  readonly inputId = input(`input-${Math.random().toString(36).slice(2)}`);
  readonly prefixIcon = input(false);

  readonly value = signal('');
  readonly isDisabled = signal(false);

  onChange: (v: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(val: string): void {
    this.value.set(val ?? '');
  }

  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(d: boolean): void {
    this.isDisabled.set(d);
  }

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.value.set(val);
    this.onChange(val);
  }
}
