import { next, rewrite } from '@vercel/functions';
import { racks } from './src/data/racks.js';

// Vercel Routing Middleware. A shared unit link (/?unit=petcenza) is served the
// prerendered copy of the home page that carries that project's share preview:
// scripts/prerender.mjs writes it to dist/units/<slug>/index.html. The address
// stays /?unit=<slug>, so the app still opens the room with the unit pulled out.
// Only known slugs are rewritten; anything else gets the normal home page.
const SLUGS = new Set(racks.flatMap((r) => r.slugs));

export const config = { matcher: '/' };

export default function middleware(request) {
  const slug = new URL(request.url).searchParams.get('unit');
  if (!slug || !SLUGS.has(slug)) return next();
  return rewrite(new URL(`/units/${slug}/index.html`, request.url));
}
