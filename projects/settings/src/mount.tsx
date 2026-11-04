import { createRoot } from 'react-dom/client';
import App from './App';
import styles from './settings.css?inline';

export function mount(element: HTMLElement): () => void {
  const style = document.createElement('style');
  style.textContent = styles;
  document.head.append(style);

  const root = createRoot(element);
  root.render(<App />);

  return () => {
    root.unmount();
    style.remove();
  };
}
