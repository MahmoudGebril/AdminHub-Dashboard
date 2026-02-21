import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { UserRole } from '../../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, ToastComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="login-brand">
          <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#4f46e5"/>
            <path d="M8 16L14 10L20 16L26 10" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 22L14 16L20 22L26 16" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>
          </svg>
          <h1>AdminHub</h1>
        </div>

        <h2>Welcome back</h2>
        <p class="login-subtitle">Sign in to your admin dashboard</p>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="login-form" novalidate>
          <div class="form-group">
            <label class="form-label" for="email">Email address</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="admin@example.com"
              autocomplete="email"
              [ngClass]="{ 'input-error': isFieldInvalid('email') }"
            />
            @if (isFieldInvalid('email')) {
              <span class="form-error">
                {{ form.get('email')?.errors?.['required'] ? 'Email is required' : 'Enter a valid email' }}
              </span>
            }
          </div>

          <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <div class="password-field">
              <input
                id="password"
                [type]="showPassword() ? 'text' : 'password'"
                formControlName="password"
                placeholder="Enter your password"
                autocomplete="current-password"
                [ngClass]="{ 'input-error': isFieldInvalid('password') }"
              />
              <button type="button" class="pwd-toggle" (click)="togglePassword()">
                @if (showPassword()) {
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                } @else {
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                }
              </button>
            </div>
            @if (isFieldInvalid('password')) {
              <span class="form-error">
                {{ form.get('password')?.errors?.['required'] ? 'Password is required' : 'Min 6 characters' }}
              </span>
            }
          </div>

          <div class="form-group">
            <label class="form-label">Sign in as</label>
            <div class="role-toggle">
              <button
                type="button"
                [class.active]="form.get('role')?.value === 'admin'"
                (click)="setRole('admin')"
              >Admin</button>
              <button
                type="button"
                [class.active]="form.get('role')?.value === 'editor'"
                (click)="setRole('editor')"
              >Editor</button>
            </div>
          </div>

          <button type="submit" class="submit-btn" [disabled]="loading()">
            @if (loading()) {
              <span class="btn-spinner"></span>
            }
            Sign In
          </button>
        </form>

        <p class="login-hint">
          Use any email & password (min 6 chars) to sign in.
        </p>
      </div>
    </div>
    <app-toast />
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      background: var(--color-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-6);
    }

    .login-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-xl);
      padding: 40px;
      width: 100%;
      max-width: 420px;
    }

    .login-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 28px;

      h1 {
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-bold);
        color: var(--color-text);
        margin: 0;
      }
    }

    h2 {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-text);
      margin: 0 0 6px;
    }

    .login-subtitle {
      color: var(--color-text-muted);
      font-size: var(--font-size-sm);
      margin: 0 0 28px;
    }

    .login-form {
      display: flex;
      flex-direction: column;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
      margin-bottom: 18px;
    }

    .form-label {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-text);
    }

    input[type=email], input[type=password], input[type=text] {
      width: 100%;
      padding: 10px 14px;
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

      &.input-error {
        border-color: var(--color-error);
        &:focus { box-shadow: 0 0 0 3px rgba(220,38,38,0.1); }
      }
    }

    .form-error {
      font-size: var(--font-size-xs);
      color: var(--color-error);
    }

    .password-field {
      position: relative;

      input { padding-right: 44px; }
    }

    .pwd-toggle {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--color-text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      padding: 2px;

      &:hover { color: var(--color-text); }
    }

    .role-toggle {
      display: flex;
      gap: 8px;

      button {
        flex: 1;
        padding: 9px;
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        background: var(--color-bg);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        color: var(--color-text-muted);
        cursor: pointer;
        transition: all var(--transition-fast);

        &.active {
          background: var(--color-primary-light);
          border-color: var(--color-primary);
          color: var(--color-primary);
        }
      }
    }

    .submit-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 11px;
      background: var(--color-primary);
      color: #fff;
      border: none;
      border-radius: var(--radius-md);
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-semibold);
      cursor: pointer;
      transition: background var(--transition-fast);
      margin-top: 8px;

      &:hover:not(:disabled) { background: var(--color-primary-hover); }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }

    .btn-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.4);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    .login-hint {
      text-align: center;
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      margin-top: var(--space-5);
    }

    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly notify = inject(NotificationService);
  private readonly router = inject(Router);

  readonly showPassword = signal(false);
  readonly loading = signal(false);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['admin' as UserRole],
  });

  isFieldInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  setRole(role: UserRole): void {
    this.form.patchValue({ role });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const { email, password, role } = this.form.getRawValue();
    setTimeout(() => {
      this.auth.login({ email: email!, password: password!, role: role as UserRole });
      this.notify.success(`Welcome back, ${role === 'admin' ? 'Admin' : 'Editor'}!`);
      this.router.navigate(['/dashboard']);
      this.loading.set(false);
    }, 800);
  }
}
