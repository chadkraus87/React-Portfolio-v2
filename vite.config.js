import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'node:child_process';

// The commit a build came from, for the build readout on the rack and in the
// footer. Vercel provides it; a local build asks git; neither leaves it empty.
const commit = () => {
  if (process.env.VERCEL_GIT_COMMIT_SHA) return process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7);
  try {
    return execSync('git rev-parse --short=7 HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return '';
  }
};

// Served from the domain root on Vercel. This was '/React-Portfolio-v2/' while
// the site lived on GitHub Pages, where assets sat under the repo name.
// src/App.jsx reads this via import.meta.env.BASE_URL for the router basename,
// so the base path is still defined in exactly one place.
export default defineConfig({
  plugins: [react()],
  base: '/',
  define: {
    __BUILD__: JSON.stringify({ time: new Date().toISOString(), sha: commit() }),
  },
  build: {
    // The smallest card variants fall under Vite's 4KB inline threshold, which
    // would base64 them into the JS bundle — eagerly loaded, uncacheable, and
    // pointless for images the cards lazy-load. Keep those as real files; every
    // other asset keeps the default behaviour.
    assetsInlineLimit: (filePath) =>
      filePath.includes('/images/cards/') ? false : undefined,
  },
});
