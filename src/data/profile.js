// ---------------------------------------------------------------------------
// PROFILE DATA: edit this file to update your name, role, links, and bio.
// No component changes needed; everything reads from here. The facts here mirror
// the resume in src/assets/files/Chad_Kraus_Resume.pdf; change both together.
// No phone number anywhere on the site, by choice.
// ---------------------------------------------------------------------------

export const profile = {
  name: 'Chadwick (Chad) Kraus',
  fullName: 'Chadwick (Chad) Kraus',
  // The hero's eyebrow, and jobTitle in the structured data.
  role: 'Network IT Specialist at Rockbot',
  title: 'Network IT Specialist at Rockbot. I own Tier 2/3 support escalations and build AI tools for support teams.',
  // The hero's headline.
  tagline: 'I own the hard support escalations, and I build the AI tools that make them faster.',
  // Three proof points in a row under the headline.
  proof: [
    'About 600 Tier 2/3 tickets and escalations a month',
    'AI voice agent now handles about 20% of overflow calls',
    'Dashboards that replaced 5 to 10 hours of manual reporting a week',
  ],
  location: 'Austin, TX (Remote)',
  email: 'chadkraus87@gmail.com',
  github: 'https://github.com/chadkraus87',
  linkedin: 'https://linkedin.com/in/chadwick-kraus',

  // Home page Background paragraphs. Add or remove strings to change the bio.
  about: [
    "By day I'm a Network IT Specialist at Rockbot. I own the Tier 2/3 queue, about 600 tickets and escalations a month, across APIs, SSO and SAML (Okta and Entra ID), customer networks and firewalls, and connected AV hardware. I'm the main link between Support and Engineering, and I co-chair the weekly Bug Triage.",
    "A lot of what I build starts as a fix for my own queue. Nightline, an after-hours AI support agent I prototyped, led Rockbot to bring in Forethought's AI voice agent. I trained that agent and built its persona, and it now handles about 20% of our overflow calls. The KPI dashboards I built with Claude Code and Zendesk's MCP server replaced 5 to 10 hours of manual reporting a week.",
    "Outside work I build full-stack and AI projects with Claude Code and Codex. The ten on this site run from a permission-gated AI assistant on my own hardware to a 62-mission networking game. Escalation work shapes how I build them. I put access rules in the database instead of the UI, put a confirmation in front of anything destructive, and write real tests, because I've been the one answering the ticket when those were missing.",
    "When I'm not working, I'm usually out hiking with my three rescue dogs.",
  ],

  // Experience, matching LinkedIn and the resume.
  experience: [
    { title: 'Network IT Specialist', org: 'Rockbot', dates: 'April 2026 – Present' },
    { title: 'Technical Support Specialist', org: 'Rockbot', dates: 'March 2025 – April 2026' },
    { title: 'Customer Support Specialist', org: 'Rockbot', dates: 'September 2022 – March 2025' },
    { title: 'Technical Support Specialist', org: '8am (formerly AffiniPay)', dates: 'April 2021 – January 2022' },
  ],

  // Certifications, with the line shown under each. Both match the resume.
  certifications: [
    { name: 'Google IT Support Professional Certificate', meta: 'Google · October 2023' },
    { name: 'Full-Stack Web Development Certificate', meta: 'The University of Texas at Austin · August 2023' },
  ],

  // The Toolbox on the home page: the resume's skills, item for item. The resume's
  // "Networking & Identity" is split in two here so it reads plainly that DNS, DHCP,
  // VPN and the firewall work are troubleshooting, not administration.
  skillGroups: [
    {
      label: 'Escalation & Troubleshooting',
      items: ['Tier 2/3 escalation ownership', 'Root cause analysis', 'Log analysis', 'REST API & SaaS diagnostics', 'Postman', 'Bug lifecycle management', 'Postmortems', 'Escalation playbooks'],
    },
    {
      label: 'Network troubleshooting',
      items: ['TCP/IP', 'DNS', 'DHCP', 'VPN', 'VLANs', 'Firewall troubleshooting', 'PoE', 'Wireshark', 'Connectivity diagnostics'],
    },
    {
      label: 'Identity & access',
      items: ['SSO', 'SAML', 'OAuth 2.0', 'MFA', 'Okta', 'Microsoft Entra ID'],
    },
    {
      label: 'AI & Automation',
      items: ['Claude Code', 'Codex', 'MCP servers', 'n8n', 'AI voice agent training (Forethought)', 'Zendesk AI co-pilot', 'Prompt engineering', 'Human-in-the-loop review'],
    },
    {
      label: 'Support Operations',
      items: ['Zendesk (admin)', 'KPI dashboards', 'Knowledge base architecture', 'SOPs & onboarding', 'Pilots & deployments', 'Jira', 'Salesforce', 'Tableau'],
    },
    {
      label: 'Development',
      items: ['JavaScript/TypeScript', 'Node.js/Express', 'React/Next.js', 'Python (FastAPI)', 'PostgreSQL/Supabase', 'SQL', 'REST APIs', 'Webhooks', 'Docker', 'Git', 'Playwright', 'Vitest'],
    },
  ],
};
