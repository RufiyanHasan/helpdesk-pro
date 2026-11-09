export interface UrlConfiguration {
  // The last part of the page's address. An empty slug means no address has been chosen yet.
  slug: string;
}

// A placeholder domain until the real one is decided.
export const VANITY_BASE_URL = 'https://helpdesk.example.com/';

export const MAX_SLUG_LENGTH = 40;

// 3 to 40 lowercase letters, numbers or hyphens, not starting or ending with a hyphen.
const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/;

export const INITIAL_URL_CONFIGURATION: UrlConfiguration = { slug: '' };

export function isValidSlug(slug: string): boolean {
  return slug === '' || SLUG_PATTERN.test(slug);
}

// Turns what is typed into a slug as you type: lowercase, with spaces as hyphens.
export function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, MAX_SLUG_LENGTH);
}
