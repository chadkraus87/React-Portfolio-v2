// ---------------------------------------------------------------------------
// NOTES / WRITING — short posts about what you learned building things.
//
// This is intentionally empty. The surface is built and wired, but nothing is
// published until you add an entry: the "Notes" nav link and the /notes route
// only appear once this array has at least one item, so the site never shows
// an empty writing section.
//
// To publish, add an object here:
//
//   {
//     slug: 'why-my-deep-links-404d',        // URL: /notes/why-my-deep-links-404d
//     title: 'Why my deep links returned 404',
//     date: '2026-09-02',                    // ISO; used for sorting + display
//     summary: 'One sentence shown in the list.',
//     body: [
//       'First paragraph.',
//       'Second paragraph. Each string is its own <p>.',
//     ],
//   }
//
// Then add the slug to the `notes` array in scripts/prerender.mjs so the post
// gets a real 200 URL and its own title/description for search and sharing.
// ---------------------------------------------------------------------------

export const notes = [
  {
    slug: 'the-404-that-only-existed-in-production',
    title: 'The 404 that only existed in production',
    date: '2026-09-02',
    summary:
      'My portfolio\u2019s deep links worked perfectly in every browser I tried and were invisible to Google the whole time. The local preview server was the reason I could not see it.',
    body: [
      'This site used to run on GitHub Pages with hash routing, so every page lived behind a fragment: /#/portfolio. That works, but fragments never reach the server, which means Google effectively saw one page instead of four. I switched to real paths to fix it.',
      'GitHub Pages has no server-side rewriting, so a request for /portfolio finds no file called portfolio and returns the 404 page. The standard workaround is to make 404.html encode the requested route into a query string and redirect to index.html, which decodes it before the app boots. I implemented that, clicked through every route, and everything worked.',
      'It was still broken. The redirect fixes what a human experiences, but the first response is still an HTTP 404, and a crawler that receives a 404 stops there \u2014 it does not wait to find out that JavaScript would have rescued the page. So the deep links looked fine to me and were being dropped by Google.',
      'The reason I could not see it locally is more interesting than the bug. Vite\u2019s preview server has SPA fallback: an unmatched path quietly returns index.html with a 200. That is convenient in development and it is the opposite of what GitHub Pages does. My local testing was not just insufficient, it was actively reassuring \u2014 it returned success for exactly the case that failed in production.',
      'The fix was to stop trusting the dev server. I wrote a throwaway static server that mimicked GitHub Pages properly: serve the file if it exists, otherwise return 404.html with a real 404 status and no fallback. Running the same clicks against that made the problem obvious in about ten seconds.',
      'The actual repair was prerendering. A short post-build script now writes a real dist/<route>/index.html for every route, so the same URL answers 200 with real HTML. As a side effect each page can carry its own title, description and social card, which a single shared index.html cannot do. The site has since moved to Vercel, where the redirect workaround is unnecessary \u2014 but the prerendering stayed, because the per-page metadata turned out to be worth more than the routing fix that motivated it.',
      'The lesson I keep coming back to is that a passing test is only as good as the environment it runs in. The dev server was not lying to me about the code. It was answering a different question than the one production would ask, and I had not noticed that those were different questions.',
    ],
  },
];

// Newest first, regardless of the order entries are written above.
export const sortedNotes = [...notes].sort((a, b) => b.date.localeCompare(a.date));
