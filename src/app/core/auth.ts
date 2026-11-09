import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
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

  private readonly currentUsername = signal('');

  // The logged-in user's name, set when they log in or when a page load checks their token.
  readonly username = this.currentUsername.asReadonly();

  token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(API_URLS.login, { username, password })
      .pipe(tap((response) => this.saveLogin(response)));
  }

  // The Client ID lives only in server/.env, so the login page asks the server for it.
  googleClientId(): Observable<string> {
    return this.http
      .get<{ clientId: string }>(API_URLS.googleConfig)
      .pipe(map(({ clientId }) => clientId));
  }

  // Sends the ID token from Google's button. The server checks it and returns our own token.
  loginWithGoogle(credential: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(API_URLS.googleLogin, { credential })
      .pipe(tap((response) => this.saveLogin(response)));
  }

  // The server keeps no session, so logging out only needs the token removed.
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.currentUsername.set('');
  }

  // Asks the server, because a stored token may have expired or been changed.
  isLoggedIn(): Observable<boolean> {
    if (!this.token()) {
      return of(false);
    }
    return this.http.get<{ username: string }>(API_URLS.me).pipe(
      map(({ username }) => {
        this.currentUsername.set(username);
        return true;
      }),
      catchError(() => {
        this.logout();
        return of(false);
      }),
    );
  }

  private saveLogin({ token, username }: LoginResponse): void {
    localStorage.setItem(TOKEN_KEY, token);
    this.currentUsername.set(username);
  }
}
