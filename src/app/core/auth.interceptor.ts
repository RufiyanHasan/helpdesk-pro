import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Auth } from './auth';
import { API_BASE_URL, API_URLS } from './api-urls';

// A 401 from these is an expected answer, not a session that just ended.
const LOGIN_CHECK_URLS = [API_URLS.login, API_URLS.me];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(API_BASE_URL)) {
    return next(req);
  }

  const auth = inject(Auth);
  const router = inject(Router);
  const token = auth.token();
  const request = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(request).pipe(
    catchError((error: unknown) => {
      const sessionEnded =
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !LOGIN_CHECK_URLS.includes(req.url);

      if (sessionEnded) {
        auth.logout();
        router.navigateByUrl('/login');
      }

      return throwError(() => error);
    }),
  );
};
