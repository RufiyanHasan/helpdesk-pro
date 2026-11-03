import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./tickets').then((m) => m.Tickets),
  },
  {
    path: 'new',
    loadComponent: () => import('./new-ticket/new-ticket').then((m) => m.NewTicket),
  },
];
