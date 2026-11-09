import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

type QueryParams = Record<string, string | number | boolean>;

// The same key the shell's Auth service saves the token under.
const TOKEN_KEY = 'helpdesk.token';

@Injectable({ providedIn: 'root' })
export class Api {
  private readonly http = inject(HttpClient);

  // Adds the token itself, so requests also work when this remote runs on its own without the shell's interceptor.
  private headers(): Record<string, string> {
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  get<T>(url: string, params?: QueryParams): Observable<T> {
    return this.http.get<T>(url, { params, headers: this.headers() });
  }

  post<T>(url: string, body: unknown): Observable<T> {
    return this.http.post<T>(url, body, { headers: this.headers() });
  }

  put<T>(url: string, body: unknown): Observable<T> {
    return this.http.put<T>(url, body, { headers: this.headers() });
  }

  patch<T>(url: string, body: unknown): Observable<T> {
    return this.http.patch<T>(url, body, { headers: this.headers() });
  }

  delete<T>(url: string, body?: unknown): Observable<T> {
    return this.http.delete<T>(url, { body, headers: this.headers() });
  }
}
