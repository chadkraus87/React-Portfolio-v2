import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Served from the domain root on Vercel. This was '/React-Portfolio-v2/' while
// the site lived on GitHub Pages, where assets sat under the repo name.
// src/App.jsx reads this via import.meta.env.BASE_URL for the router basename,
// so the base path is still defined in exactly one place.
export default defineConfig({
  plugins: [react()],
  base: '/',
});
