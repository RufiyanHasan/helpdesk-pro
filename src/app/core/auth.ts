import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { API_URLS } from './api-urls';

// The tickets remote and the React settings page read the token from the same key.
export const TOKEN_KEY = 'helpdesk.token';

interface LoginResponse {
  token: string;
  username: string;
}

// The token is kept in localStorage, and the auth interceptor sends it with every API request.
@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly http = inject(HttpClient);

  token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(API_URLS.login, { username, password })
      .pipe(tap(({ token }) => localStorage.setItem(TOKEN_KEY, token)));
  }

  // The server keeps no session, so logging out only needs the token removed.
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  // Asks the server, because a stored token may have expired or been changed.
  isLoggedIn(): Observable<boolean> {
    if (!this.token()) {
      return of(false);
    }
    return this.http.get(API_URLS.me).pipe(
      map(() => true),
      catchError(() => {
        this.logout();
        return of(false);
      }),
    );
  }
}
