import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { API_URLS } from './api-urls';

// The token lives in an HttpOnly cookie, so this service never sees it. The server sets and clears it.
@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly http = inject(HttpClient);

  login(username: string, password: string): Observable<unknown> {
    return this.http.post(API_URLS.login, { username, password });
  }

  logout(): Observable<unknown> {
    return this.http.post(API_URLS.logout, null);
  }

  isLoggedIn(): Observable<boolean> {
    return this.http.get(API_URLS.me).pipe(
      map(() => true),
      catchError(() => of(false)),
    );
  }
}
