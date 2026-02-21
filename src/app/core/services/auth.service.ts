import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthUser, LoginCredentials } from '../../models/user.model';
import { StorageService } from './storage.service';

const AUTH_KEY = 'auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);

  private readonly _user = signal<AuthUser | null>(
    this.storage.get<AuthUser>(AUTH_KEY)
  );

  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly isAdmin = computed(() => this._user()?.role === 'admin');
  readonly currentRole = computed(() => this._user()?.role ?? null);

  login(credentials: LoginCredentials): boolean {
    const mockUser: AuthUser = {
      id: '1',
      name: credentials.role === 'admin' ? 'Omar Hassan' : 'Layla Mahmoud',
      email: credentials.email,
      role: credentials.role,
      token: `mock-token-${Date.now()}`,
    };
    this._user.set(mockUser);
    this.storage.set(AUTH_KEY, mockUser);
    return true;
  }

  logout(): void {
    this._user.set(null);
    this.storage.remove(AUTH_KEY);
    this.router.navigate(['/auth/login']);
  }
}
