import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      input: 'src/mount.tsx',
      preserveEntrySignatures: 'strict',
      output: { entryFileNames: 'mount.js' },
    },
  },
  // Forwards /api to the server when React runs on its own.
  server: { proxy: { '/api': 'http://localhost:3000' } },
  preview: { port: 4203, strictPort: true, proxy: { '/api': 'http://localhost:3000' } },
});
