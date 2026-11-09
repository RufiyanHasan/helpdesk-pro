// Not a secret: Google shows it to every browser that loads the sign-in button.
// It must match GOOGLE_CLIENT_ID in server/.env.
export const GOOGLE_CLIENT_ID = '960305526507-mp1tm1aff31e6ubd57qbep0sippor98o.apps.googleusercontent.com';

const SCRIPT_URL = 'https://accounts.google.com/gsi/client';

interface GoogleCredentialResponse {
  credential: string;
}

export interface GoogleAccountsId {
  initialize(config: { client_id: string; callback: (response: GoogleCredentialResponse) => void }): void;
  renderButton(parent: HTMLElement, options: Record<string, string | number>): void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } };
  }
}

let scriptLoading: Promise<GoogleAccountsId> | undefined;

// Loads Google's script once, the first time the login page needs it.
export function loadGoogleSignIn(): Promise<GoogleAccountsId> {
  scriptLoading ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => (window.google ? resolve(window.google.accounts.id) : reject(new Error('No Google')));
    script.onerror = () => {
      // Lets the next visit to the login page try again.
      scriptLoading = undefined;
      reject(new Error('Could not load Google sign-in'));
    };
    document.head.append(script);
  });
  return scriptLoading;
}
