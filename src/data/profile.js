// ---------------------------------------------------------------------------
// PROFILE DATA — edit this file to update your name, tagline, links, and bio.
// No component changes needed; everything reads from here.
// ---------------------------------------------------------------------------

export const profile = {
  name: 'Chad Kraus',
  fullName: 'Chadwick Kraus',
  title: 'Network IT Specialist · QA Ops · AI Tooling',
  tagline:
    'I keep enterprise AV and network deployments healthy, run QA and bug triage, and build AI agents with Claude Code that turn reactive support into proactive operations.',
  location: 'Austin, TX (Remote)',
  email: 'chadkraus87@gmail.com',
  phone: '(512) 650-7633',
  github: 'https://github.com/chadkraus87',
  linkedin: 'https://linkedin.com/in/chadwick-kraus',

  // Shown in the hero as mono "status" tags
  heroTags: ['tier 2/3 escalations', 'bug triage lead', 'claude code', 'next.js + supabase'],

  // About page paragraphs — add/remove strings to change the bio.
  about: [
    "I'm a Network IT Specialist at Rockbot, where my scope runs well past the job title: Tier 2/3 escalation ownership across networking, AV hardware, APIs, and identity systems; QA Ops testing cycles; chairing the weekly Bug Triage meeting; and end-to-end pilot account management for SMB and Enterprise customers.",
    "The through-line in my work is finding the gap before the customer does. I've protected a major enterprise rollout by catching a firmware compatibility issue mid-deployment, resolved a hardware defect during a multi-location credit union install that became a company-wide fix, and built a proactive SD card health monitoring workflow that converts silent device errors into courtesy replacements before anyone opens a ticket.",
    "I build AI agents and applications with Claude Code — intelligent triage workflows, support automation, and full-stack side projects like TrainCraft (an AI-powered platform for personal trainers) and Flowline (a multi-tenant B2B workflow tool), both on a Next.js + Supabase stack. I hold a Full-Stack Web Development certificate from UT Austin and the Google IT Support Specialist certification.",
    "Off the clock I'm usually in the Texas Hill Country with my German Shepherd mix, or heads-down on the next build.",
  ],

  // Skills shown on the About page, grouped like the resume.
  skillGroups: [
    { label: 'AI Tooling & Ops', items: ['Claude Code', 'AI agent development', 'Intelligent triage', 'Workflow automation', 'Zendesk AI Co-Pilot'] },
    { label: 'Networking & Support', items: ['TCP/IP', 'VLANs', 'Firewall config', 'Tier 2/3 escalations', 'Root cause analysis'] },
    { label: 'QA & Testing', items: ['QA Ops', 'Bug triage leadership', 'Defect verification', 'Regression validation'] },
    { label: 'Identity & Auth', items: ['SSO / SAML', 'OAuth', 'Okta', 'Microsoft Entra'] },
    { label: 'Development', items: ['JavaScript', 'React', 'Node.js', 'Next.js', 'Supabase', 'MySQL', 'MongoDB', 'Git'] },
  ],
};
