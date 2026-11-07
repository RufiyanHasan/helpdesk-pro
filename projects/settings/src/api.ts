import type { PageText } from './page-text';

const API_BASE_URL = 'http://localhost:3000/api';
const PAGE_TEXT_URL = `${API_BASE_URL}/vanity-page/page-text`;

// The login cookie is only sent to the API with credentials: 'include'.
async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(url, { ...init, credentials: 'include' });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

// null means the user hasn't saved any Page Text yet.
export function getPageText(): Promise<PageText | null> {
  return request<PageText | null>(PAGE_TEXT_URL);
}

export function savePageText(pageText: PageText): Promise<PageText> {
  return request<PageText>(PAGE_TEXT_URL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pageText),
  });
}
