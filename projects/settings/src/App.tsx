import { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="settings">
      <h1>Settings</h1>
      <p>This page is rendered by React.</p>
      <button type="button" onClick={() => setCount(count + 1)}>
        Clicked {count} times
      </button>
    </div>
  );
}
