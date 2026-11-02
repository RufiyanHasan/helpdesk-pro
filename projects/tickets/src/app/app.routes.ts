import { Routes } from '@angular/router';

export const routes: Routes = [
    {path: '', redirectTo: 'tickets', pathMatch: 'full'},
    {
        path: 'tickets',
        loadComponent: () => import('./tickets/tickets').then((m) => m.Tickets),
    },
];
