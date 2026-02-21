import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  HostListener,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { StorageService } from '../../core/services/storage.service';

const SIDEBAR_KEY = 'sidebar_collapsed';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, NavbarComponent, ToastComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app-shell">
      @if (!isMobile()) {
        <app-sidebar
          [collapsed]="sidebarCollapsed()"
          (collapseToggled)="toggleSidebar()"
        />
      }

      @if (isMobile() && mobileOpen()) {
        <div class="mobile-overlay" (click)="mobileOpen.set(false)">
          <app-sidebar
            [collapsed]="false"
            (collapseToggled)="mobileOpen.set(false)"
          />
        </div>
      }

      <div class="main-content">
        <app-navbar (mobileToggled)="mobileOpen.set(true)" />
        <main class="page-content">
          <router-outlet />
        </main>
      </div>
    </div>
    <app-toast />
  `,
  styles: [`
    .mobile-overlay {
      position: fixed;
      inset: 0;
      z-index: var(--z-sidebar);
      display: flex;
      background: rgba(0,0,0,0.5);

      app-sidebar {
        flex-shrink: 0;
      }
    }
  `],
})
export class ShellComponent {
  private readonly storage = inject(StorageService);

  readonly sidebarCollapsed = signal<boolean>(
    this.storage.get<boolean>(SIDEBAR_KEY) ?? false
  );
  readonly mobileOpen = signal(false);
  readonly isMobile = signal(window.innerWidth <= 768);

  @HostListener('window:resize')
  onResize(): void {
    this.isMobile.set(window.innerWidth <= 768);
    if (!this.isMobile()) this.mobileOpen.set(false);
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update((v) => !v);
    this.storage.set(SIDEBAR_KEY, this.sidebarCollapsed());
  }
}
