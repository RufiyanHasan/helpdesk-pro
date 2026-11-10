import { createContext, useContext, type MouseEvent, type ReactNode } from 'react';

// Inside the shell, Angular's router owns the address bar. This app only reads which page to show (`path`)
// and asks the shell to change it (`navigate`), so the sidebar, back button and refreshes stay in sync.
export interface Navigation {
  // Where the shell shows this app, e.g. /dashboard/tickets. Empty when it runs on its own.
  basePath: string;
  // The part after basePath: '' for the list, 'new', or a ticket ID.
  path: string;
  navigate: (path: string) => void;
}

const NavigationContext = createContext<Navigation | null>(null);

export const NavigationProvider = NavigationContext.Provider;

export function useNavigation(): Navigation {
  const navigation = useContext(NavigationContext);
  if (!navigation) {
    throw new Error('useNavigation needs a NavigationProvider');
  }
  return navigation;
}

interface LinkProps {
  to: string;
  className?: string;
  children: ReactNode;
}

// A real link, so it shows the address on hover and can open in a new tab, but a normal click
// changes the page through `navigate` instead of reloading.
export function Link({ to, className, children }: LinkProps) {
  const { basePath, navigate } = useNavigation();
  const href = to ? `${basePath}/${to}` : basePath || '/';

  function open(event: MouseEvent<HTMLAnchorElement>): void {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    navigate(to);
  }

  return (
    <a className={className} href={href} onClick={open}>
      {children}
    </a>
  );
}
