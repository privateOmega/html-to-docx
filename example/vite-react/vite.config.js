import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// No Node polyfills are needed: html-to-docx 2 runs in the browser as is.
export default defineConfig({
  plugins: [react()],
});
