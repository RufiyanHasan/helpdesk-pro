import { Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { loggedInGuard, loggedOutGuard } from './core/auth.guards';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full'},
  {
    path: 'login',
    canActivate: [loggedOutGuard],
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'dashboard',
    canActivate: [loggedInGuard],
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
    children: [
      {path: '', redirectTo: 'tickets', pathMatch: 'full'},
      {
        path: 'tickets',
        // One route for every tickets address, so the same React app stays on screen while it changes pages.
        children: [
          {
            path: '**',
            loadComponent: () =>
              import('./pages/dashboard/tickets-host/tickets-host').then((m) => m.TicketsHost),
          },
        ],
      },
      {
        // The original Angular version of Tickets, kept so the two can be compared.
        path: 'tickets-angular',
        loadChildren: () => loadRemoteModule('tickets', './Routes').then((m) => m.routes),
      },
      {
        path: 'topics',
        loadComponent: () => import('./pages/dashboard/topics/topics').then((m) => m.Topics),
      },
      {
        path: 'landing-page',
        loadComponent: () =>
          import('./pages/dashboard/landing-page/landing-page').then((m) => m.LandingPage),
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/dashboard/settings/settings').then((m) => m.Settings),
      },
    ],
  },
];
