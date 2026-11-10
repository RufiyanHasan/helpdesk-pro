import { createRoot } from 'react-dom/client';
import App from './App';
import { NavigationProvider, type Navigation } from './lib/navigation';
import styles from './styles/tickets.css?inline';

export interface TicketsHandle {
  // The shell calls this when its router changes the address, e.g. after the browser's back button.
  setPath(path: string): void;
  unmount(): void;
}

// The shell calls this with the element to draw in, the page to show, and how to change pages.
export function mount(element: HTMLElement, navigation: Navigation): TicketsHandle {
  const style = document.createElement('style');
  style.textContent = styles;
  document.head.append(style);

  const root = createRoot(element);
  let current = navigation;

  function render(): void {
    root.render(
      <NavigationProvider value={current}>
        <App />
      </NavigationProvider>,
    );
  }

  render();

  return {
    setPath(path) {
      current = { ...current, path };
      render();
    },
    unmount() {
      root.unmount();
      style.remove();
    },
  };
}
