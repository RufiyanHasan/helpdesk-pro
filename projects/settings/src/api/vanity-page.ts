const VANITY_PAGE_URL = 'http://localhost:3000/api/vanity-page';
const LOGO_URL = `${VANITY_PAGE_URL}/logo`;

// Keeps the status code, so callers can tell e.g. a taken URL (409) from other failures.
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, statusText: string) {
    super(`${status} ${statusText}`);
    this.status = status;
  }
}

// The same key the shell's Auth service saves the token under. React runs inside the shell's page,
// so it can read the shell's localStorage.
const TOKEN_KEY = 'helpdesk.token';

function withToken(init: RequestInit = {}): RequestInit {
  const headers = new Headers(init.headers);
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return { ...init, headers };
}

async function send(url: string, init: RequestInit = {}): Promise<Response> {
  const response = await fetch(url, withToken(init));
  if (!response.ok) {
    throw new ApiError(response.status, response.statusText);
  }
  return response;
}

// null means the user hasn't saved this section yet.
export async function getVanitySection<T>(section: string): Promise<T | null> {
  const response = await send(`${VANITY_PAGE_URL}/${section}`);
  return response.json() as Promise<T | null>;
}

export async function saveVanitySection<T>(section: string, settings: T): Promise<T> {
  const response = await send(`${VANITY_PAGE_URL}/${section}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  return response.json() as Promise<T>;
}

// null means the user hasn't uploaded a logo.
export async function getLogo(): Promise<Blob | null> {
  const response = await fetch(LOGO_URL, withToken());
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new ApiError(response.status, response.statusText);
  }
  return response.blob();
}

// The file is sent as it is, with its type in the Content-Type header.
export async function saveLogo(file: File): Promise<void> {
  await send(LOGO_URL, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
}

export async function deleteLogo(): Promise<void> {
  await send(LOGO_URL, { method: 'DELETE' });
}
