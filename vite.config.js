import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base must match the GitHub repo name so assets resolve on GitHub Pages.
// If you ever rename the repo, update this one line.
export default defineConfig({
  plugins: [react()],
  base: '/React-Portfolio-v2/',
});
