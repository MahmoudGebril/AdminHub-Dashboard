import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
  DestroyRef,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { StorageService } from '../../core/services/storage.service';
import { NotificationService } from '../../core/services/notification.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { AppSettings } from '../../models/api.model';

const SETTINGS_KEY = 'app_settings';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule, CardComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header">
      <div>
        <h1>Settings</h1>
        <p>Manage your account and application preferences</p>
      </div>
    </div>

    <div class="settings-layout">
      <!-- Profile -->
      <app-card title="Profile">
        <div class="profile-section">
          <div class="profile-avatar">
            {{ auth.user()?.name?.charAt(0) }}
          </div>
          <div class="profile-info">
            <h3>{{ auth.user()?.name }}</h3>
            <p>{{ auth.user()?.email }}</p>
            <span class="role-badge">{{ auth.user()?.role }}</span>
          </div>
        </div>
      </app-card>

      <!-- Appearance -->
      <app-card title="Appearance">
        <form [formGroup]="form" class="settings-form">
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">Dark Mode</span>
              <span class="setting-desc">Switch between light and dark interface</span>
            </div>
            <label class="toggle">
              <input type="checkbox" formControlName="darkMode" />
              <span class="toggle-track"></span>
            </label>
          </div>

          <div class="divider"></div>

          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">Language</span>
              <span class="setting-desc">Interface language</span>
            </div>
            <select formControlName="language">
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="es">Español</option>
            </select>
          </div>

          <div class="divider"></div>

          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">Date Format</span>
              <span class="setting-desc">How dates are displayed</span>
            </div>
            <select formControlName="dateFormat">
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </form>
      </app-card>

      <!-- Notifications -->
      <app-card title="Notifications">
        <form [formGroup]="form" class="settings-form">
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">Email Notifications</span>
              <span class="setting-desc">Receive alerts via email</span>
            </div>
            <label class="toggle">
              <input type="checkbox" formControlName="emailNotifications" />
              <span class="toggle-track"></span>
            </label>
          </div>

          <div class="divider"></div>

          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">Push Notifications</span>
              <span class="setting-desc">Browser push notifications</span>
            </div>
            <label class="toggle">
              <input type="checkbox" formControlName="pushNotifications" />
              <span class="toggle-track"></span>
            </label>
          </div>
        </form>
      </app-card>

      <!-- Save -->
      <div class="save-row">
        <app-button variant="secondary" (clicked)="resetDefaults()">Reset Defaults</app-button>
        <app-button variant="primary" [loading]="saving()" (clicked)="save()">Save Settings</app-button>
      </div>
    </div>
  `,
  styles: [`
    .settings-layout {
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
      max-width: 680px;
    }

    .profile-section {
      display: flex;
      align-items: center;
      gap: var(--space-5);
    }

    .profile-avatar {
      width: 64px;
      height: 64px;
      border-radius: var(--radius-full);
      background: var(--color-primary);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      flex-shrink: 0;
    }

    .profile-info {
      h3 {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text);
        margin: 0 0 4px;
      }

      p {
        font-size: var(--font-size-sm);
        color: var(--color-text-muted);
        margin: 0 0 8px;
      }
    }

    .role-badge {
      display: inline-flex;
      padding: 2px 10px;
      background: var(--color-primary-light);
      color: var(--color-primary);
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      text-transform: capitalize;
    }

    .settings-form {
      display: flex;
      flex-direction: column;
    }

    .setting-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-4) 0;
      gap: var(--space-4);
    }

    .setting-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .setting-label {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-medium);
      color: var(--color-text);
    }

    .setting-desc {
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
    }

    .toggle {
      position: relative;
      display: inline-block;
      width: 44px;
      height: 24px;
      flex-shrink: 0;
      cursor: pointer;

      input {
        opacity: 0;
        width: 0;
        height: 0;

        &:checked + .toggle-track {
          background: var(--color-primary);

          &::after { transform: translateX(20px); }
        }
      }
    }

    .toggle-track {
      position: absolute;
      inset: 0;
      background: var(--color-border-strong);
      border-radius: var(--radius-full);
      transition: background var(--transition-fast);

      &::after {
        content: '';
        position: absolute;
        left: 2px;
        top: 2px;
        width: 20px;
        height: 20px;
        background: #fff;
        border-radius: var(--radius-full);
        transition: transform var(--transition-fast);
        box-shadow: var(--shadow-sm);
      }
    }

    select {
      padding: 8px 12px;
      font-size: var(--font-size-sm);
      color: var(--color-text);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      outline: none;
      cursor: pointer;
      transition: border-color var(--transition-fast);
      min-width: 160px;

      &:focus { border-color: var(--color-primary); }
    }

    .divider {
      height: 1px;
      background: var(--color-border);
    }

    .save-row {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
    }
  `],
})
export class SettingsComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly theme = inject(ThemeService);
  private readonly storage = inject(StorageService);
  private readonly notify = inject(NotificationService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly saving = signal(false);

  readonly form = this.fb.group({
    darkMode: [false],
    language: ['en'],
    dateFormat: ['MM/DD/YYYY'],
    emailNotifications: [true],
    pushNotifications: [false],
  });

  ngOnInit(): void {
    const saved = this.storage.get<Record<string, unknown>>(SETTINGS_KEY);
    if (saved) {
      this.form.patchValue(saved);
    } else {
      this.form.patchValue({ darkMode: this.theme.theme() === 'dark' });
    }

    this.form.get('darkMode')!.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((dark) => {
        this.theme.setTheme(dark ? 'dark' : 'light');
      });
  }

  save(): void {
    this.saving.set(true);
    setTimeout(() => {
      this.storage.set(SETTINGS_KEY, this.form.getRawValue());
      this.notify.success('Settings saved successfully');
      this.saving.set(false);
    }, 600);
  }

  resetDefaults(): void {
    this.form.reset({
      darkMode: false,
      language: 'en',
      dateFormat: 'MM/DD/YYYY',
      emailNotifications: true,
      pushNotifications: false,
    });
    this.theme.setTheme('light');
    this.notify.info('Settings reset to defaults');
  }
}
