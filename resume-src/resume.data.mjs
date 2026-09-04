// Single source of truth for the resume. Both the DOCX and the PDF are
// generated from this file so they can never drift apart.

export const resume = {
  name: 'Chadwick (Chad) Kraus',
  title:
    'Network IT Specialist  ·  QA Ops  ·  Technical Support Lead  ·  AI Tooling & Automation',
  contact: [
    '(512) 650-7633',
    'chadkraus87@gmail.com',
    'Austin, TX (Remote)',
    'linkedin.com/in/chadwick-kraus',
    'chad-kraus-portfolio.vercel.app',
  ],

  summary:
    'Technical professional with 5+ years spanning network and IT support, AV systems, QA operations, and AI tooling across SaaS and networked-device environments. Currently Network IT Specialist at Rockbot, owning Tier 2/3 escalations end to end while leading initiatives that convert reactive support into proactive programs — including a fleet-wide legacy-hardware business case covering 2,000+ devices and an AI voice model that absorbed overflow call-center volume. Builds the tooling as well as the process: ten production applications shipped with Claude Code, including incident-response simulators, infrastructure consoles, and AI systems designed around explicit permission boundaries and database-enforced access control. Known for identifying operational gaps, engineering them closed, and translating fluently between engineering and non-technical stakeholders.',

  skills: [
    ['AI Tooling & Ops',
      'AI agent & application development (Claude Code) · AI voice model training · intelligent triage · workflow automation · Zendesk AI Co-Pilot · agent assist · prompt engineering · support data hygiene'],
    ['Technical Support',
      'Tier 2/3 escalation ownership · root cause analysis · console log analysis · API & SaaS diagnostics · hardware & network troubleshooting · escalation playbooks'],
    ['AV & Device Systems',
      'Smart Amp configuration & troubleshooting · Rockbot Players · Sonos · BrightSign · Amazon Signage Stick · Tizen 7.0 · PoE · digital signage · AV signal flow'],
    ['Networking',
      'TCP/IP · VLANs · firewall configuration · enterprise network environments · connectivity diagnostics'],
    ['QA & Testing',
      'QA Ops · product testing cycles · defect verification · bug triage leadership · regression validation · risk analysis · automated test suites (Vitest, Playwright)'],
    ['Identity & Auth',
      'SSO · SAML · MFA · OAuth 2.0 · Okta · Azure AD / Microsoft Entra · API integrations'],
    ['Operations & Enablement',
      'SOP & playbook development · onboarding program design · team training · KPI dashboards & support reporting · knowledge base architecture · pilot account management · Zendesk administration'],
    ['Communication',
      'Cross-functional liaison · technical ↔ non-technical translation · stakeholder reporting · business case development · team mentorship · customer success & CRM'],
    ['Development',
      'JavaScript · TypeScript · React · Next.js · Node.js · Python (FastAPI) · REST APIs · PostgreSQL (row-level security) · Supabase · MySQL · MongoDB · Docker · Git · Claude Code'],
  ],

  experience: [
    {
      role: 'Network IT Specialist',
      dates: 'April 2026 – Present',
      org: 'Rockbot  ·  Austin, TX (Remote)',
      bullets: [
        'Spearheaded a fleet-wide business case identifying 2,000+ devices running end-of-life firmware or legacy media-player hardware, then built the proactive outreach program offering affected customers a guided upgrade path — converting a latent support liability into incremental hardware revenue while reducing unplanned downtime through white-glove replacement ahead of failure.',
        'Trained and deployed an AI voice model to absorb overflow call volume previously routed to an external call center, reducing vendor spend while maintaining coverage during peak periods.',
        'Built a KPI tracking dashboard for the Escalation team surfacing ticket closure time and recurring issue themes, giving the team a shared view of where resolution time is lost and which defects are trending before they become escalations.',
        'Leading the rebuild of the company knowledge base around an intuitive tagging taxonomy, linking every customer-facing article back to internal documentation so answers stay traceable to a single source of truth and customers self-serve faster.',
        'Created the Escalation team onboarding package and actively train new team members on escalation ownership, root cause methodology, and cross-functional handoff; authored the deployment documentation and escalation playbooks adopted across the Support organization.',
        'Developed a Google Chrome extension that translates raw Smart Amp diagnostic data into plain language, allowing non-specialist agents to interpret device state without escalating.',
        'Own Tier 2/3 escalations across networking, firewall configuration, AV hardware (Smart Amp, Sonos, BrightSign, Tizen), APIs, identity systems (SSO/SAML/Entra), and SaaS platform behavior — full accountability from triage through resolution, including daily Smart Amp support across audio signal flow, speaker detection, firmware behavior, and network connectivity.',
        'Serve as one of the primary technical owners for pilot and trial execution across SMB, Enterprise, and SLA customers — leading white-glove deployment readiness, installation calls, and post-launch postmortems to identify root causes and prevent recurrence.',
        'Caught firmware defects mid-deployment on two major rollouts — a large multi-location enterprise account and a multi-location credit union — driving full-fleet Engineering remediation and company-wide fixes before customer impact.',
        'Built a proactive SD card health monitoring workflow after finding that Player SD card errors were logged but unaddressed: daily triage detects errors, classifies root cause (failure vs. ejection), determines replacement eligibility, and proactively contacts affected customers — converting a reactive support scenario into a proactive customer touchpoint.',
        'Active QA Ops team member completing product testing cycles and verifying defects with Engineering; chair the weekly Bug Triage meeting and produce Bug Triage notes, Bug Highlights, and monthly Support-identified bug reports for cross-functional leadership, acting as primary liaison between Engineering/QA and all customer-facing teams.',
        'Build AI agents and applications with Claude Code to automate support workflows and improve intelligent triage; currently developing Zendesk AI Co-Pilot capabilities across agent assist, self-service, and support data hygiene.',
      ],
    },
    {
      role: 'Senior Technical Support & Escalation Specialist',
      dates: 'September 2022 – April 2026',
      org: 'Rockbot  ·  Austin, TX (Remote)',
      bullets: [
        'Led technical ownership of high-severity escalations involving hardware, networks, APIs, identity systems, and SaaS platform behavior; conducted deep root cause analysis in collaboration with QA and Engineering.',
        'Provided escalation support across the AV and networked device portfolio — Rockbot Players, Smart Amps, Sonos, Amazon Signage Stick, and Tizen — diagnosing issues across networks, AV signal flow, and device behavior.',
        'Identified critical customer-impacting bugs enabling proactive Engineering fixes that reduced ticket volume; produced weekly Bug Triage notes and monthly Support-identified bug reports across four cross-functional teams.',
        'Served as cross-functional liaison translating technical issues into actionable updates for non-technical stakeholders; mentored technical specialists and developed SOPs and training materials.',
      ],
    },
    {
      role: 'Technical Support Specialist',
      dates: 'April 2021 – January 2022',
      org: '8am (formerly AffiniPay)  ·  Austin, TX',
      bullets: [
        'Provided escalation support for a financial SaaS platform handling API integrations, payment workflows, and transaction errors; led troubleshooting across web, network, and integration layers.',
        'Guided clients through PCI compliance, secure usage practices, and fraud mitigation; maintained 99%+ CSAT.',
      ],
    },
  ],

  projectsIntro: 'Ten production applications built with Claude Code — full portfolio at chad-kraus-portfolio.vercel.app',
  projects: [
    {
      name: 'TechOps Command Center',
      blurb: 'Incident-response simulator',
      stack: 'Next.js · TypeScript · Recharts · Vitest · Playwright',
      text: 'Simulates outages across a fifteen-service infrastructure. Charts, logs, dependency map, and customer complaints all derive from one model, so failures propagate as they do in production rather than being scripted per scenario. Eight scenarios, deterministic replay, 187 automated tests.',
    },
    {
      name: 'HomeLab Commander',
      blurb: 'Local-first operations console',
      stack: 'Next.js · TypeScript · React Flow · Playwright + axe',
      text: 'Device discovery, service monitoring, network topology, and incident workflow in one console. The hosted demo runs a deterministic simulated lab; local installs add private-network discovery, Docker inventory, and TLS expiry checks behind explicit boundaries.',
    },
    {
      name: 'Jarvis',
      blurb: 'Permission-gated personal AI assistant',
      stack: 'FastAPI · Docker Compose · Chroma · Claude API · Tailscale',
      text: 'Runs entirely on home infrastructure with on-device wake-word detection, so audio never leaves the machine. Connectors are deny-by-default; destructive actions require human confirmation. A security audit during the build closed an OAuth CSRF gap.',
    },
    {
      name: 'Meridian',
      blurb: 'Local-first AI workforce platform',
      stack: 'Next.js · TypeScript · Docker · MCP',
      text: 'Nineteen specialist agents coordinated by a chief-of-staff role that reports NOT READY rather than smoothing over a failing check. Irreversible actions stop at an approval boundary; the audit trail is append-only and hash-chained so tampering is detectable.',
    },
    {
      name: 'PetCenza',
      blurb: 'Household pet health record',
      stack: 'React · TypeScript · Supabase (Postgres RLS) · PWA',
      text: 'Sharing is enforced in the database across 26 tables with per-pet roles and TOTP MFA rather than in the client. Offline-first, with an IndexedDB queue replaying writes on reconnect. 101 unit tests, Playwright E2E specs, and a SQL-level access-isolation suite.',
    },
  ],

  education: [
    {
      title: 'Full-Stack Web Development Certificate',
      org: 'University of Texas at Austin',
      detail: 'JavaScript · HTML5 · CSS3 · Node.js · Express.js · MySQL · MongoDB · React · Git · REST APIs',
      date: 'August 2023',
    },
    {
      title: 'Google IT Support Specialist Professional Certificate',
      org: '',
      detail: 'Network Engineering · System Administration (Windows, Linux, Mac) · Network Security',
      date: 'October 2023',
    },
  ],
};
