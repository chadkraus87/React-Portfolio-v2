// ---------------------------------------------------------------------------
// PROFILE DATA — edit this file to update your name, tagline, links, and bio.
// No component changes needed; everything reads from here.
// ---------------------------------------------------------------------------

export const profile = {
  name: 'Chadwick (Chad) Kraus',
  fullName: 'Chadwick (Chad) Kraus',
  title:
    'Network IT Specialist at Rockbot — Tier 2/3 escalations, QA operations, and AI tooling built to prevent the next ticket.',
  tagline:
    'I build systems, and I keep them running. Ten shipped applications on this site — AI tooling, infrastructure consoles, and games that teach the systems they simulate — plus a day job owning the escalations that teach me what to build next.',
  location: 'Austin, TX (Remote)',
  email: 'chadkraus87@gmail.com',
  phone: '(512) 650-7633',
  github: 'https://github.com/chadkraus87',
  linkedin: 'https://linkedin.com/in/chadwick-kraus',

  // Shown in the hero as mono "status" tags
  heroTags: [
    'Tier 2/3 Escalations',
    'Root Cause Analysis',
    'Technical Operations',
    'AI Automation',
    'Next.js + Supabase',
  ],

  // About page paragraphs — add/remove strings to change the bio.
  about: [
    'They span more ground than a single stack: a permission-gated AI assistant running entirely on my own hardware, a pet health record whose sharing rules live in Postgres rather than in the interface, an incident-response simulator built on a single deterministic model, an operations console for a homelab, and two games that teach networking and systems architecture by making you operate them.',
    'I came to building through operations, and that is the part that shapes how I build. Years of Tier 2/3 escalations teach you exactly how software fails in the field: the permission that was too broad, the check that lived in the client instead of the database, the retry that made an outage worse. So my projects tend to enforce access in Postgres row-level security rather than the UI, keep audit trails that detect tampering, run destructive actions behind explicit confirmation, and carry real test suites — because I have been the person paged when none of that was true.',
    "By day I'm a Network IT Specialist at Rockbot, owning Tier 2/3 escalations across networking, AV hardware, APIs, identity systems and SaaS platform behavior. The work I'm proudest of there is the proactive kind: a business case identifying 2,000+ devices running end-of-life firmware and the customer upgrade program built around it, an AI voice model trained to absorb overflow call-center volume, and the KPI dashboard the escalation team now runs on. I chair weekly bug triage and wrote the onboarding package new escalation engineers train from.",
    'The two halves reinforce each other. Support work tells me which failure modes are worth engineering against; building the software tells me what Engineering is actually weighing when I escalate. Claude Code is how I close the distance between the two quickly — but the judgment about what to build, what to verify, and what to refuse to ship is the part I bring.',
    "Outside of work you'll usually find me hiking with my three rescue dogs, coaching fitness clients, or building the next side project that teaches me something new.",
  ],

  // Selected certifications — shown on the About page.
  certifications: [
    'Google IT Support Professional Certificate',
    'Full-Stack Web Development – The University of Texas at Austin',
    'NASM Certified Personal Trainer + Certified Nutrition Coach',
  ],

  // Skills shown on the About page, grouped like the resume.
  skillGroups: [
    {
      label: 'AI Tooling & Ops',
      items: ['Claude Code', 'AI Automation', 'Agentic Workflows', 'Support Automation', 'Prompt Engineering', 'Zendesk AI'],
    },
    {
      label: 'Networking & Support',
      items: ['TCP/IP', 'VLANs', 'Firewall config', 'Tier 2/3 Escalations', 'Root cause analysis', 'DNS', 'DHCP', 'VPN', 'API Troubleshooting', 'Postman'],
    },
    {
      label: 'QA & Testing',
      items: ['Bug Triage', 'QA Operations', 'Regression Testing', 'Defect Validation', 'Release Verification'],
    },
    {
      label: 'Identity & Auth',
      items: ['SSO/SAML', 'OAuth 2.0', 'Okta', 'Microsoft Entra'],
    },
    {
      label: 'Development',
      items: ['JavaScript', 'React', 'Node.js', 'Next.js', 'Supabase', 'MySQL', 'MongoDB', 'Git', 'REST APIs', 'HTML/CSS', 'Postman', 'GitHub'],
    },
    {
      label: 'Customer Success & Operations',
      items: ['Enterprise Deployments', 'Technical Operations', 'Customer Enablement', 'Pilot Programs', 'Cross-functional Leadership', 'Process Improvement', 'Documentation'],
    },
  ],
};
