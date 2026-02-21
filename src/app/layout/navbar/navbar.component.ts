import {
  Component,
  ChangeDetectionStrategy,
  inject,
  output,
} from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="navbar">
      <button class="mobile-toggle" (click)="mobileToggled.emit()" aria-label="Toggle menu">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      <div class="navbar__spacer"></div>

      <div class="navbar__actions">
        <!-- Theme toggle -->
        <button class="icon-btn" (click)="theme.toggle()" [title]="theme.theme() === 'dark' ? 'Light mode' : 'Dark mode'">
          @if (theme.theme() === 'dark') {
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          } @else {
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          }
        </button>

        <!-- User menu -->
        <div class="user-menu">
          <div class="user-avatar">
            {{ auth.user()?.name?.charAt(0) }}
          </div>
          <div class="user-info">
            <span class="user-name">{{ auth.user()?.name }}</span>
            <span class="user-role">{{ auth.user()?.role }}</span>
          </div>
        </div>

        <!-- Logout -->
        <button class="icon-btn icon-btn--danger" (click)="auth.logout()" title="Logout">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </header>
  `,
  styles: [`
    .navbar {
      height: var(--navbar-height);
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      padding: 0 var(--space-6);
      gap: var(--space-4);
      flex-shrink: 0;
      z-index: var(--z-navbar);
    }

    .mobile-toggle {
      display: none;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: none;
      border: none;
      border-radius: var(--radius-md);
      color: var(--color-text-muted);
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover { background: var(--color-border); color: var(--color-text); }

      @media (max-width: 768px) { display: flex; }
    }

    .navbar__spacer { flex: 1; }

    .navbar__actions {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .icon-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: none;
      border: none;
      border-radius: var(--radius-md);
      color: var(--color-text-muted);
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover {
        background: var(--color-border);
        color: var(--color-text);
      }

      &--danger:hover {
        background: var(--color-error-bg);
        color: var(--color-error);
      }
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: 6px 10px;
      border-radius: var(--radius-md);
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-full);
      background: var(--color-primary);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      flex-shrink: 0;
    }

    .user-info {
      display: flex;
      flex-direction: column;

      @media (max-width: 640px) { display: none; }
    }

    .user-name {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-text);
      line-height: 1.2;
    }

    .user-role {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      text-transform: capitalize;
    }
  `],
})
export class NavbarComponent {
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  readonly mobileToggled = output<void>();
}
