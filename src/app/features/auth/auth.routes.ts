import { Routes } from '@angular/router';
import { guestGuard } from '../../core/guards/guest.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./components/login.component').then((m) => m.LoginComponent),
  },
];
