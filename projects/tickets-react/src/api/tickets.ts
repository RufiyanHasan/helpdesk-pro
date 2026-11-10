import type { NewTicketRequest, Ticket, TicketDetail, TicketsResponse } from '../types';

// Same domain as the page. In development, the shell's proxy (or Vite's, when run on its own) forwards /api to port 3000.
const API_BASE_URL = '/api';

// The same key the shell's Auth service saves the login token under.
const TOKEN_KEY = 'helpdesk.token';

// Keeps the status code, so pages can tell e.g. a missing ticket (404) from other failures.
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, statusText: string) {
    super(`${status} ${statusText}`);
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (init.body) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });

  // The login has expired, so go to the login page, as the shell's interceptor does for Angular requests.
  if (response.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    window.location.assign('/login');
  }
  if (!response.ok) {
    throw new ApiError(response.status, response.statusText);
  }
  return response.json() as Promise<T>;
}

export interface TicketQuery {
  page: number;
  pageSize: number;
  search: string;
  sortBy: string;
  sortDir: string;
  status: string;
  priority: string;
  assignee: string;
  topic: string;
}

export function getTickets(query: TicketQuery, signal?: AbortSignal): Promise<TicketsResponse> {
  const params = new URLSearchParams(Object.entries(query).map(([key, value]) => [key, String(value)]));
  return request<TicketsResponse>(`/tickets?${params}`, { signal });
}

export function getTicket(id: string, signal?: AbortSignal): Promise<TicketDetail> {
  return request<TicketDetail>(`/tickets/${encodeURIComponent(id)}`, { signal });
}

export function createTicket(ticket: NewTicketRequest): Promise<Ticket> {
  return request<Ticket>('/tickets', { method: 'POST', body: JSON.stringify(ticket) });
}

export function deleteTickets(ids: string[]): Promise<{ deleted: number }> {
  return request<{ deleted: number }>('/tickets', { method: 'DELETE', body: JSON.stringify({ ids }) });
}
