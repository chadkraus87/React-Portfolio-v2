// ---------------------------------------------------------------------------
// FIELD NOTES — short build stories, in Chad's voice.
//
// DRAFT: awaiting Chad's review before it goes live. These replace the retired
// /notes section. They were rewritten from the published notes so they read as
// a developer directing Claude Code, without playing down his own calls on
// security and verification. Ground rules:
//   - "I" for decisions and judgement the published notes already credited to
//     Chad, plus facts from his profile (he is a certified trainer).
//   - "we" for anything found or built together; the session transcripts do not
//     always show who spotted a problem first.
//   - No new technical claims. Every one was already in the published notes.
//
// projectStories render on /projects/<slug>. siteStories render in "How this
// site was built" on the home page.
// ---------------------------------------------------------------------------
export const projectStories = {
  petcenza: {
    title: 'A rate limiter that limited nothing',
    body: [
      'PetCenza stores household records and lets people invite others into them, so I had Claude Code rate-limit the endpoints someone would abuse first: sign-in, invitations and uploads. The limiter read an identifier off the request, counted requests per identifier inside a window, and rejected anything over the threshold. The code read correctly and the unit tests passed.',
      'Before calling it done, we sent the live endpoint far more requests than a person would. Every one of them went through.',
      'The counting logic was fine. The key was the problem. The header it counted against changed from one request to the next, so every request looked like a new client with a fresh allowance. A unit test can’t catch that, because the test supplies the key itself. It proves the counting works and says nothing about whether you’re counting the right thing.',
      'The fix moved the key to a value a client can’t rotate on each request. The counting code never changed.',
      'Now, when something is supposed to say no, I check that it actually says no against the real deployment before I trust it. From the outside, a limiter that never fires looks exactly like one that’s broken.',
    ],
  },
  coachrhythm: {
    title: 'Safety that doesn’t depend on the model',
    body: [
      'CoachRhythm turns a client intake (injuries, available equipment, goals) into a training plan. I’m a certified personal trainer, so the failure I cared about most was the obvious one: programming something that hurts a person, like loaded overhead pressing for an impinged shoulder.',
      'The quick way to build it is to list the injuries in the prompt and ask the model to avoid them. I didn’t want safety to depend on the model following instructions. When that fails it fails silently, because a plan that breaks a constraint looks the same as one that respects it.',
      'So the filter runs before the model does. Claude Code built a deterministic screen that checks every exercise against the client’s logged contraindications, and the model only ever sees what survives. It can’t program a movement it was never offered.',
      'The plan then goes through a second check with no model in it: movement balance, pull-to-push volume, recovery spacing, rep ranges and progression. A failed check gets one retry with the failure attached. If it still fails, the plan is saved as a flagged draft instead of being presented as finished.',
      'Filtering first sometimes leaves the model a thin pool and a duller program. For a client with an injury, I’d rather ship the duller program.',
    ],
  },
};

export const siteStories = [
  {
    id: 'routing',
    title: 'The 404 that only existed in production',
    body: [
      'This site started on GitHub Pages with hash routing, so every page lived behind a fragment like /#/portfolio and search engines effectively saw one page. We moved to real paths, which on GitHub Pages needs a workaround: the 404 page redirects into the app, and the app shows the right route.',
      'Every link worked when I clicked through. It was still broken. A deep link’s first response was an HTTP 404, and a crawler stops at a 404 without waiting for JavaScript to rescue the page. The local preview server hid it, because it answers unknown paths with a 200.',
      'When I started checking the site in Search Console, I had Claude Code stop trusting the dev server and build a small static server that behaves like GitHub Pages. The problem showed up in seconds. The fix was prerendering: every route is now a real HTML file that returns 200 with its own title, description and social card. The site has since moved to Vercel, and the prerendering stayed.',
    ],
  },
  {
    id: 'images',
    title: 'The image that loaded but never painted',
    body: [
      'Every screenshot here ships as AVIF at four widths. The generator used to call sips, the image tool built into macOS, and above roughly 1024px sips writes a tiled file. Chrome accepts it, reports the right size, logs nothing, and paints a blank rectangle.',
      'It shipped that way. The widest file only loads on high-density screens, and the check we relied on was naturalWidth greater than zero, which passes on an image with no pixels because the header is honest about the size.',
      'We replaced sips with Pillow, and the generator now fails if any output is tiled. Image checks on this site draw each image onto a canvas pre-filled with a sentinel color and read the pixels back. If the sentinel is still there, nothing rendered.',
      'It’s the same shape as a lot of support tickets: the service is up, the dashboard is green, and the customer still can’t do what they came to do. I try to check what the user actually gets.',
    ],
  },
];
