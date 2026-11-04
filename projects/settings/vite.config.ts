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
  preview: { port: 4203, strictPort: true },
});
