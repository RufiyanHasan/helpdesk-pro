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
