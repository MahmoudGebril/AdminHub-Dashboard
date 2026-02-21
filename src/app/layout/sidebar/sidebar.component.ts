import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  output,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="sidebar" [class.sidebar--collapsed]="collapsed()">
      <div class="sidebar__brand">
        <div class="brand-logo">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#4f46e5"/>
            <path d="M8 16L14 10L20 16L26 10" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 22L14 16L20 22L26 16" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>
          </svg>
        </div>
        @if (!collapsed()) {
          <span class="brand-name">AdminHub</span>
        }
      </div>

      <nav class="sidebar__nav">
        @for (item of navItems; track item.route) {
          @if (!item.adminOnly || auth.isAdmin()) {
            <a
              [routerLink]="item.route"
              routerLinkActive="nav-item--active"
              class="nav-item"
              [title]="collapsed() ? item.label : ''"
            >
              <span class="nav-icon" [innerHTML]="item.icon"></span>
              @if (!collapsed()) {
                <span class="nav-label">{{ item.label }}</span>
              }
            </a>
          }
        }
      </nav>

      <div class="sidebar__footer">
        <button class="collapse-btn" (click)="collapseToggled.emit()" [title]="collapsed() ? 'Expand' : 'Collapse'">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            @if (collapsed()) {
              <polyline points="9 18 15 12 9 6"/>
            } @else {
              <polyline points="15 18 9 12 15 6"/>
            }
          </svg>
          @if (!collapsed()) {
            <span>Collapse</span>
          }
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: var(--sidebar-width);
      height: 100vh;
      background: var(--sidebar-bg);
      display: flex;
      flex-direction: column;
      transition: width var(--transition-slow);
      flex-shrink: 0;
      overflow: hidden;
      z-index: var(--z-sidebar);

      &--collapsed {
        width: var(--sidebar-collapsed-width);
      }
    }

    .sidebar__brand {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      flex-shrink: 0;
      min-height: var(--navbar-height);
    }

    .brand-logo {
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }

    .brand-name {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
      color: #fff;
      white-space: nowrap;
    }

    .sidebar__nav {
      flex: 1;
      padding: 16px 8px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      overflow-y: auto;

      &::-webkit-scrollbar { width: 0; }
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: var(--radius-md);
      color: var(--sidebar-text);
      text-decoration: none;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      transition: all var(--transition-fast);
      white-space: nowrap;

      &:hover {
        background: var(--sidebar-hover-bg);
        color: var(--sidebar-text-active);
        text-decoration: none;
      }

      &--active {
        background: var(--sidebar-active-bg);
        color: var(--sidebar-text-active);
      }
    }

    .nav-icon {
      display: flex;
      align-items: center;
      flex-shrink: 0;
      width: 20px;
      height: 20px;

      ::ng-deep svg {
        width: 20px;
        height: 20px;
      }
    }

    .sidebar__footer {
      padding: 12px 8px;
      border-top: 1px solid rgba(255,255,255,0.08);
    }

    .collapse-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 10px 12px;
      background: none;
      border: none;
      color: var(--sidebar-text);
      border-radius: var(--radius-md);
      cursor: pointer;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      transition: all var(--transition-fast);

      &:hover {
        background: var(--sidebar-hover-bg);
        color: var(--sidebar-text-active);
      }
    }
  `],
})
export class SidebarComponent {
  readonly auth = inject(AuthService);
  readonly collapsed = input(false);
  readonly collapseToggled = output<void>();

  readonly navItems: NavItem[] = [
    {
      label: 'Dashboard',
      route: '/dashboard',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,
    },
    {
      label: 'Users',
      route: '/users',
      adminOnly: false,
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    },
    {
      label: 'Products',
      route: '/products',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
    },
    {
      label: 'Settings',
      route: '/settings',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
    },
  ];
}
