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
