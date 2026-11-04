import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

type QueryParams = Record<string, string | number | boolean>;

// The login cookie is only sent to the API with withCredentials, including when this remote runs on its own.
const withCredentials = true;

@Injectable({ providedIn: 'root' })
export class Api {
  private readonly http = inject(HttpClient);

  get<T>(url: string, params?: QueryParams): Observable<T> {
    return this.http.get<T>(url, { params, withCredentials });
  }

  post<T>(url: string, body: unknown): Observable<T> {
    return this.http.post<T>(url, body, { withCredentials });
  }

  put<T>(url: string, body: unknown): Observable<T> {
    return this.http.put<T>(url, body, { withCredentials });
  }

  patch<T>(url: string, body: unknown): Observable<T> {
    return this.http.patch<T>(url, body, { withCredentials });
  }

  delete<T>(url: string, body?: unknown): Observable<T> {
    return this.http.delete<T>(url, { body, withCredentials });
  }
}
