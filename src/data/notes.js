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
// That is all. The prerender step reads this file, so the post's page, its
// title/description, and its sitemap entry are generated automatically.
// ---------------------------------------------------------------------------

export const notes = [
  {
    slug: 'a-rate-limiter-that-limited-nothing',
    title: 'A rate limiter that limited nothing',
    date: '2026-09-03',
    summary:
      'The code was correct, the tests passed, and the limiter allowed every request through. The bug was in the key, not the logic.',
    body: [
      'PetCenza has endpoints worth protecting \u2014 auth, invitations, uploads \u2014 so it has a rate limiter. The implementation was the obvious one: pull the client identifier off the request header, count requests per identifier in a window, reject over the threshold. It read correctly, and it did not work at all.',
      'The problem was that the header I keyed on was not stable per client. It varied between requests. Every request therefore looked like a brand new client with a fresh budget, so the counter never accumulated and the threshold was never reached. The limiter dutifully counted to one, over and over, forever.',
      'Nothing about this shows up in a unit test, because a unit test hands the limiter a key you chose yourself. Given the same key twice, the logic increments correctly and rejects on cue. The test proves the counting works. It cannot prove that the thing you counted is the thing you meant to count.',
      'It only surfaced when I hammered the live endpoint and watched the requests sail through. That is the whole lesson: a limiter is two pieces \u2014 the counting, and the identity you count against \u2014 and only one of them is visible in the code you are reviewing. Identity is a property of the deployed environment, so it has to be verified there.',
      'The fix was to move the key onto a value the client cannot rotate or spoof per request. The counting logic never changed; it was correct the whole time.',
      'What I took from it is a habit rather than a rule. When something is supposed to say no, I now check that it actually said no to me, against the real deployment, before I trust it. Security controls fail quietly by definition \u2014 a limiter that never triggers and a limiter that is broken look exactly the same from the outside, right up until they do not.',
    ],
  },
  {
    slug: 'safety-that-does-not-depend-on-the-model',
    title: 'Safety that does not depend on the model',
    date: '2026-09-01',
    summary:
      'CoachRhythm generates training plans for people with injuries. The safety rule is that the model never gets the chance to make the unsafe choice.',
    body: [
      'CoachRhythm turns a client intake \u2014 injuries, available equipment, goals \u2014 into a training program. The obvious failure mode is prescribing something that hurts someone: a loaded overhead press for a client with a shoulder impingement, deep flexion for a bad knee.',
      'The obvious implementation is to tell the model about the injuries and ask it not to do that. I did not want to build it that way, because that design makes safety a property of instruction-following. Models are good at instruction-following. They are not perfectly reliable at it, and the failure is silent \u2014 a plan that violates a constraint looks exactly like a plan that respects one.',
      'So the filter runs before the model does. Exercises are screened against the client\u2019s logged contraindications deterministically, and the model is handed an already-filtered pool. It cannot program a contraindicated movement because it never sees one. The unsafe option is absent rather than discouraged.',
      'The output then clears a second deterministic pass \u2014 movement balance, pull-to-push volume, recovery spacing, rep ranges, progression \u2014 with no model anywhere in the verification path. A failed check feeds one automatic retry with the failure as context. A plan that still fails is stored as a flagged draft rather than presented as finished, because a visibly incomplete plan is safer than a confidently wrong one.',
      'This costs something. Filtering first means the model sometimes works from a thin pool and produces a duller program than it could have. I would rather ship the duller program.',
      'The general shape has held up across everything I have built since: decide what must never happen, then make it structurally impossible rather than instructed against. In Jarvis that is deny-by-default connectors and human confirmation before anything destructive. In PetCenza it is row-level security in the database instead of checks in the client. Same idea each time \u2014 put the guarantee somewhere that does not require anything to behave well.',
    ],
  },
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
