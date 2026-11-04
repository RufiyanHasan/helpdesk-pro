import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { Auth } from './auth';

export const loggedInGuard: CanActivateFn = () => {
  const router = inject(Router);
  return inject(Auth)
    .isLoggedIn()
    .pipe(map((loggedIn) => loggedIn || router.parseUrl('/login')));
};

export const loggedOutGuard: CanActivateFn = () => {
  const router = inject(Router);
  return inject(Auth)
    .isLoggedIn()
    .pipe(map((loggedIn) => !loggedIn || router.parseUrl('/dashboard')));
};
