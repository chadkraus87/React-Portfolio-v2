import { next, rewrite } from '@vercel/functions';
import { racks } from './src/data/racks.js';
import { TOOL_SLUGS } from './src/data/toolSlugs.js';

// Vercel Routing Middleware. A shared link is served a prerendered copy of the page
// that carries its own share preview (scripts/prerender.mjs writes them):
//   /?unit=petcenza           -> dist/units/petcenza/index.html
//   /portfolio?tool=supabase  -> dist/portfolio/tools/supabase/index.html
//   /?tool=supabase           -> the same tool preview (the room fires that tool)
// The address stays the same, so the app still opens the unit or applies the filter.
// Only known slugs are rewritten; anything else gets the normal page.
const SLUGS = new Set(racks.flatMap((r) => r.slugs));
const TOOLS = new Set(TOOL_SLUGS);

export const config = { matcher: ['/', '/portfolio', '/portfolio/'] };

export default function middleware(request) {
  const url = new URL(request.url);
  if (url.pathname === '/portfolio' || url.pathname === '/portfolio/') {
    const tool = url.searchParams.get('tool');
    return tool && TOOLS.has(tool) ? rewrite(new URL(`/portfolio/tools/${tool}/index.html`, request.url)) : next();
  }
  const slug = url.searchParams.get('unit');
  if (slug && SLUGS.has(slug)) return rewrite(new URL(`/units/${slug}/index.html`, request.url));
  const tool = url.searchParams.get('tool');
  if (tool && TOOLS.has(tool)) return rewrite(new URL(`/portfolio/tools/${tool}/index.html`, request.url));
  return next();
}
