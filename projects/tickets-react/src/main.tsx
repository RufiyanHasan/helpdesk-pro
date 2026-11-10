// Runs the app on its own (npm run dev), using the browser's address bar directly instead of the shell's router.
// Logging in still happens in the shell: the token is read from this origin's localStorage.
import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { NavigationProvider } from './lib/navigation';
import styles from './styles/tickets.css?inline';

function currentPath(): string {
  return decodeURIComponent(location.pathname).replace(/^\//, '');
}

function Standalone() {
  const [path, setPath] = useState(currentPath);

  useEffect(() => {
    const onBack = () => setPath(currentPath());
    window.addEventListener('popstate', onBack);
    return () => window.removeEventListener('popstate', onBack);
  }, []);

  function navigate(next: string): void {
    history.pushState(null, '', `/${next}`);
    setPath(next);
  }

  return (
    <NavigationProvider value={{ basePath: '', path, navigate }}>
      <App />
    </NavigationProvider>
  );
}

const style = document.createElement('style');
style.textContent = styles;
document.head.append(style);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Standalone />
  </StrictMode>,
);
