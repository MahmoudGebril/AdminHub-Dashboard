import { Routes } from '@angular/router';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/users.component').then((m) => m.UsersComponent),
  },
];
