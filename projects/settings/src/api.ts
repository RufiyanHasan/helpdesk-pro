const VANITY_PAGE_URL = 'http://localhost:3000/api/vanity-page';

// The login cookie is only sent to the API with credentials: 'include'.
async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(url, { ...init, credentials: 'include' });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

// null means the user hasn't saved this section yet.
export function getVanitySection<T>(section: string): Promise<T | null> {
  return request<T | null>(`${VANITY_PAGE_URL}/${section}`);
}

export function saveVanitySection<T>(section: string, settings: T): Promise<T> {
  return request<T>(`${VANITY_PAGE_URL}/${section}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
}
