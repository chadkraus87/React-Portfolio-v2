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

export const notes = [];

// Newest first, regardless of the order entries are written above.
export const sortedNotes = [...notes].sort((a, b) => b.date.localeCompare(a.date));
