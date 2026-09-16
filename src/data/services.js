// ---------------------------------------------------------------------------
// HOSTED SERVICES — the ones a live demo actually calls while it runs, so an outage
// at their end takes the demo with it. Only these belong in "If a shared service went
// down" on /status: a build or test tool (Vite, Playwright, Vitest) going offline
// doesn't stop a demo that is already deployed.
//
// Every name must match a tool on some project's stack; the build checks that.
// ---------------------------------------------------------------------------
export const hostedServices = ['Supabase', 'Vercel', 'Claude API'];
