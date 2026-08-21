/** Figma 2971:219110 / collaboration doc — Build popup long-scroll bodies. */

export type BuildCaseStudyDetail = {
  statusLabel: string;
  trigger: string;
  observation: string;
  hypothesis: string;
  /** Rookieball adds a value beat between hypothesis and experiment. */
  value?: string;
  experiment: string;
  statusBody: string;
  checklist: { done: boolean; text: string }[];
  whoFor: string;
  howItWorks: string[];
  insights: string[];
};

export const BUILD_PROJECT_DETAILS: Record<string, BuildCaseStudyDetail> = {
  leoney: {
    statusLabel: "Status: Prototype",
    trigger:
      "Leoney started with sending remittances home to Sierra Leone and wanting that money to become something more than an outflow, infrastructure back home instead of just support.",
    observation:
      "Diaspora remittances make up a significant share of Sierra Leone's GDP, money that leaves and rarely returns as anything durable. At the same time, entrepreneurs trying to import goods face a real gap: no reliable way to source products from China and get them into Sierra Leone without navigating shipping and customs mostly blind.",
    hypothesis:
      "What if reducing the diaspora's dependence on remittances and solving the sourcing problem were the same project. Redirect part of what would go home as cash into structured savings and local investment, while giving entrepreneurs a reliable, transparent way to import and price goods.",
    experiment:
      "The build combines an AI sourcing agent, matching a stated budget against verified Chinese suppliers and Sierra Leone market pricing to show landed cost and real margin, with a savings layer tracking what families are building instead of sending. The current prototype shows this live: total saved, average savings per family, and an active sourcing agent side by side.",
    statusBody:
      'A working prototype exists with real interface and beta framing, "12 families in beta program," but I can\'t confirm from what I have whether that reflects an actual pilot or is illustrative copy.',
    checklist: [
      { done: true, text: "Concept and dual problem framing established" },
      {
        done: true,
        text: "AI sourcing agent logic designed, purchase price through landed cost",
      },
      { done: true, text: "Website and app prototype built" },
      { done: false, text: "Beta program, real or illustrative" },
      { done: false, text: "Current live status" },
    ],
    whoFor:
      "Diaspora senders who want their support to build something lasting. Entrepreneurs in Sierra Leone who need a trustworthy way to import goods and know what they'll actually make.",
    howItWorks: [
      "Enter a budget or product category, no need to already know what to import.",
      "The sourcing agent matches it against verified Chinese suppliers and local market pricing.",
      "See the full landed cost, purchase price through freight, customs, and margin, before committing.",
      "Buy space in a shared container and track the shipment.",
      "Customs handled on arrival, with delivery or pickup and proof of delivery.",
    ],
    insights: [
      "Two problems, one platform — access and income treated as one design problem, not two separate products.",
      "Logistics first — trust gets built by reliably getting goods there before asking anyone to trust the AI's recommendations.",
      "Not e-commerce, infrastructure — the longer bet is becoming the operating system for small-scale trade between China, the diaspora, and Sierra Leone.",
    ],
  },
  pebble: {
    statusLabel: "Status: In progress",
    trigger:
      "Researching homeschooling options for my son, I noticed every tool on the market taught the child. Curriculum, lesson plans, YouTube channels, planners. Nothing was built for the mom holding the morning together.",
    observation:
      "The real gap wasn't curriculum discovery, parents already have that. It was execution, alone, at 8:47 on a Tuesday when the kid is resistant, yesterday went badly, and there's no one nearby who understands what that morning actually feels like.",
    hypothesis:
      "What if the problem isn't the lesson plan, it's the isolation. If moms could feel other families schooling alongside them in real time, and learn from each other's small daily wins, the hardest part of homeschooling might stop being the mornings themselves.",
    experiment:
      "The core loop, Circle, Session, Reflection, Soft Reveal, opens each day with a shared Rhythm Room, live or async, where a mom runs a focused session with her child, then reflects. Those reflections feed a Confidence Loop, anonymized community wisdom surfaced back as gentle prompts. Nothing observes the child directly, every signal is parent-authored by design.",
    statusBody:
      "The plan calls for a founder-led launch, 10 to 25 founding moms with live daily circle presence, before any wider release. Whether that cohort has actually started is not confirmed from what I have.",
    checklist: [
      {
        done: true,
        text: "Problem and target segment defined, ages 5 to 8, ADHD households as a priority archetype",
      },
      { done: true, text: "Core loop and product architecture designed" },
      { done: true, text: "Pricing and business model drafted" },
      { done: false, text: "Founding cohort launch" },
      { done: false, text: "Legal review, children's data compliance" },
    ],
    whoFor:
      "Homeschool moms, especially in ADHD households where mornings are hardest to hold together. Charter and co-op families as a secondary group riding the same daily rhythm.",
    howItWorks: [
      "Set up your curriculum once, about 15 minutes.",
      "Tap Start School to enter a live or async Rhythm Room.",
      "Mark subjects done together, building a passive record without extra data entry.",
      "Add an optional voice or text reflection for context.",
      "See gentle, anonymized patterns from other families surface back as Soft Reveals.",
    ],
    insights: [
      "Not a curriculum tool — the gap isn't finding a lesson plan, it's getting through the morning that plan requires.",
      "Zero child data by design — every signal is parent-authored reflection, nothing watches or tracks the child directly.",
      "The real competitor is the status quo — not another app, but the isolated WhatsApp threads and normalized chaos families already default to.",
    ],
  },
  gradstudio: {
    statusLabel: "Status: In progress",
    trigger:
      "A decade of teaching design students in China every summer, brought back each year partly because I had the checklist these students aspired to, Carnegie Mellon, then Meta, and could speak to what it actually took to get there.",
    observation:
      "The gap runs both directions. Applicants get fragmented advice with no structured way to build a portfolio or understand program fit. Institutes have no scalable way to assess or support applicant readiness at all, everything happens one mentor, one conversation at a time.",
    hypothesis:
      "What if this is a two-sided problem with a two-sided solution. Institutes get tools to support and evaluate applicants at scale as a paying customer. Applicants get research, portfolio development, and career preparation as the end user, both sides working off the same infrastructure.",
    experiment:
      "The platform routes each user through onboarding, data synthesis, and product creation, using trajectory nodes to personalize the path and professional data integration to map background automatically. A case-study builder pressure-tests portfolio work against school-specific criteria, powered in part by a research and sensemaking module built from earlier SenseSpace work, feeding into a shared data layer institutes and mentors both draw from.",
    statusBody:
      "A full PRD and site architecture exist, including marketing-site prototypes built against real structural precedents. Whether either side of the marketplace, institutes or applicants, has moved past prototype is not confirmed from what I have.",
    checklist: [
      {
        done: true,
        text: "Two-sided problem identified through direct teaching experience",
      },
      { done: true, text: "Full PRD and site architecture developed" },
      {
        done: true,
        text: "Case-study builder and trajectory-routing logic designed",
      },
      { done: false, text: "Institute-side pilot or paying customer" },
      { done: false, text: "Business model and pricing confirmed" },
    ],
    whoFor:
      "Design and art institutes who need a scalable way to assess and support applicant readiness, as the paying customer. Applicants navigating admissions with no structured way to build a case for themselves, as the end user.",
    howItWorks: [
      "A student's background and projects get mapped through onboarding and trajectory routing.",
      "The research and sensemaking module turns raw work into structured case studies.",
      "The case-study builder pressure-tests that work against program-specific criteria.",
      "Institutes access the same data layer to support and evaluate their applicants.",
      "Mentorship and feedback close the loop on both sides.",
    ],
    insights: [
      "Two customers, one platform — institutes and applicants aren't served by separate tools, they share the same infrastructure.",
      "Practitioner-built, not generic ed-tech — grounded in real admissions casework and a research methodology built from actual PhD-level work.",
      "A recurring pattern — CollegeVine's AI-driven recruitment model shows up here and resurfaces later in Leoney's own architecture.",
    ],
  },
  rookieball: {
    statusLabel: "Status: Specified",
    trigger:
      "Rookieball started with watching my son play sports and thinking about what his game footage could become if it were captured as data from the start, not just memories, but a profile that could grow with him and show where he actually stands.",
    observation:
      "Interviews with athletes and families surfaced the same gap over and over. Families don't lack access to information, they lack a system. Academics, stats, video, and deadlines live in a dozen different places, and most families don't know where their athlete realistically stands until it's too late to act on it.",
    hypothesis:
      "What if the real problem in recruiting isn't exposure, it's clarity. If an athlete could see exactly how they compare to the level they're aiming for, and exactly what closes that gap, recruiting could become a development plan instead of a guessing game.",
    value:
      "Most recruiting platforms help athletes market themselves once they're already competitive. Rookieball's bet is earlier and different: help the athlete become recruitable in the first place, understand yourself, understand the level, close the gap, then pursue what actually fits.",
    experiment:
      "The design centers on a full athlete profile, feeding a Reality Check that benchmarks the athlete against real recruits at their target level, and a Level-Up system that turns the gaps into a living roadmap. Four specialized AI companions, Coach Alex on athletics, Sarah on academics, Coach Sam on exposure, and Sage as the conversational guide, deliver that intelligence to the athlete and their family.",
    statusBody:
      "Right now this is a fully specified product and business architecture, athlete profile, benchmarking system, AI team, pricing tiers, and growth plan, not yet a built product. The project's own roadmap names Foundation, authentication, onboarding, athlete profile, as the first phase still ahead.",
    checklist: [
      { done: true, text: "Problem and family interviews documented" },
      { done: true, text: "Product architecture and AI team defined" },
      { done: true, text: "Business model and pricing structure drafted" },
      { done: false, text: "Foundation build, authentication and onboarding" },
      { done: false, text: "Current live status" },
    ],
    whoFor:
      "Athletes who need an honest read on where they stand and a real path forward, not another database to search. Families managing a process that was never built to be managed by one household alone.",
    howItWorks: [
      "Build a full athlete profile spanning athletics, academics, and goals.",
      "Reality Check compares that profile against real recruiting benchmarks.",
      "Level-Up turns the gaps into a personalized roadmap.",
      "The AI team guides the athlete through it, athletic, academic, exposure, and conversational.",
      "When ready, a Coach Ready profile packages everything for college coaches.",
    ],
    insights: [
      "Reality check over exposure — most platforms help you get seen, Rookieball helps you understand where you actually stand first.",
      "A team, not a chatbot — four specialists with defined jobs, not one generic assistant.",
      "A roadmap, not a checklist — tasks change as the athlete changes, tied to why they matter now.",
    ],
  },
  "sensespace-ai": {
    statusLabel: "Status: Shipped (2024)",
    trigger:
      "Managing design teams across Meta and elsewhere, I kept watching the same thing happen. Researchers would gather rich interview data, then lose most of a week just trying to make sense of it before any real design work could start.",
    observation:
      "The deeper problem wasn't the time lost, it was what the delay caused. Engineering built technically sound things that misread user needs. Design proposed things users wanted that were never feasible. The gap between raw data and actionable insight was where good products kept dying.",
    hypothesis:
      "What if that gap could close with a taxonomy, not a generic AI wrapper. Ground the tool in specific, named design research methodologies from my PhD work, and let it identify patterns a taxonomy-blind AI would miss entirely.",
    experiment:
      "Built with Spencer Allred, Hibban Butt, and Mohammad Sial between May and December 2024, in partnership with Carnegie Mellon. The tool takes interviews, live or uploaded, and runs them through that taxonomy alongside emotional analysis of tone and expression, turning transcripts into structured, traceable insight.",
    statusBody:
      "Used by more than 50 design teams, cutting analysis time by 70%. Built on 50+ practitioner interviews and testing with 25 designers before launch. Current status beyond December 2024 is not confirmed from what I have.",
    checklist: [
      {
        done: true,
        text: "Taxonomy of design research methodologies built from PhD work",
      },
      { done: true, text: "Tool built and tested with 50+ design teams" },
      { done: true, text: "Full case study published" },
      { done: false, text: "Current live status" },
    ],
    whoFor:
      "Design researchers losing a week per project to manual synthesis. Product teams who need traceable evidence behind a design decision, not just a summary.",
    howItWorks: [
      "Conduct a live interview or upload existing text, audio, or video.",
      "The taxonomy identifies patterns across the transcript.",
      "Patterns become structured insights, with a traceable link back to the source moment.",
      "Emotional analysis adds tone and expression as a second signal.",
      "Export and share results directly with the team.",
    ],
    insights: [
      "A taxonomy, not a wrapper — the differentiator is grounding pattern recognition in named design research methods, not generic language modeling.",
      "Workflow over standalone — testing found 87% of researchers prioritized integration into existing tools over a new destination app.",
      "Emotional context as data — one researcher noted understanding emotional context mattered more than the literal transcript, which shaped the tool's emotion recognition layer.",
    ],
  },
  "deepsocal-agent": {
    statusLabel: "Status: Prototype",
    trigger:
      "Running design and research engagements across Orange County and the wider Southern California region, I kept hitting the same wall. Every new client meant rebuilding context from scratch, research sat in old decks, customer intelligence went stale, and nothing the agency learned on one engagement carried forward to the next.",
    observation:
      "The agency's real asset wasn't the interface. It was the ability to know a business quickly and act on that knowledge, and neither the agency's own growth nor its clients' growth were actually benefiting from that pattern repeating itself.",
    hypothesis:
      "What if one agent could serve both sides of that same problem. Use it to bring in the agency's own clients, and once they're in, use the same underlying intelligence to run their growth through a defined lifecycle instead of starting fresh each time.",
    experiment:
      "The agent ingests a client's materials into a persistent profile, then reasons across five stages, Acquire, Activate, Convert, Upsell, Referral, each with its own dashboard and input type, and generates specific, prioritized growth plays with service-match scoring rather than generic marketing ideas. The same underlying system also runs lead generation and outreach for the agency itself. An admin backend configures templates and tracks execution across both.",
    statusBody:
      "Built with real screens and working dashboards across all five stages, though a persistent bug in the client portal sidebar was still being resolved, and the agency itself was tracked as pre-revenue at the time this was last documented.",
    checklist: [
      { done: true, text: "Five-stage client lifecycle system designed and built" },
      { done: true, text: "Admin backend for service templates and execution tracking" },
      {
        done: true,
        text: "Internal lead-generation and outreach layer built on the same system",
      },
      { done: false, text: "Client portal sidebar bug — resolved or not" },
      { done: false, text: "Current live status" },
      { done: false, text: "First paying client confirmed" },
    ],
    whoFor:
      "The agency itself, needing its own growth to compound instead of resetting with every new business-development push. The agency's clients, needing a clear, prioritized path through their own growth instead of a generic strategy deck.",
    howItWorks: [
      "Client materials, research, site, briefs, feed into a persistent profile.",
      "The agent diagnoses where the client has the largest opportunity across five lifecycle stages.",
      "It generates specific plays, segment, insight, channel, message, budget, and a way to measure it.",
      "A human reviews before anything launches.",
      "Results feed back in, so the next recommendation is sharper than the last.",
    ],
    insights: [
      "One system, two jobs — the same intelligence that grows the agency's own client base runs its clients' growth too.",
      "Plays, not ideas — every recommendation is a full play, segment through KPI, not a suggestion needing translation into action.",
      "Context that compounds — the core bet is that agency expertise should get sharper with every engagement, not reset each time.",
    ],
  },
  "mineral-pulse": {
    statusLabel: "Status: Prototype",
    trigger:
      "Mineral Pulse extends my PhD research into a working prototype, mapping mineral producing nations across Africa so the conditions communities and investors depend on are no longer hidden.",
    observation:
      "Extractive economies generate enormous value that rarely flows back as durable local infrastructure or transparent market signal. Without a shared map of producing nations, conditions, and flows, communities and investors are making decisions in the dark.",
    hypothesis:
      "What if post-extractive design frameworks could become a live instrument, not just a research argument. A prototype that makes mineral flows, producing nations, and hidden conditions visible enough to act on.",
    experiment:
      "The build turns dissertation-level research into an interactive map and data layer, visualizing mineral producing nations across Africa and the conditions that shape investment and community outcomes.",
    statusBody:
      "A working prototype exists as a thinking record tied to ongoing PhD work. How far it has moved beyond research visualization toward a live product is not confirmed from what I have.",
    checklist: [
      { done: true, text: "PhD research foundation established" },
      { done: true, text: "Producing-nations map and data model drafted" },
      { done: false, text: "Live product beyond research prototype" },
      { done: false, text: "Current live status" },
    ],
    whoFor:
      "Communities in mineral producing regions who need conditions made visible. Investors and policymakers who need more than aggregate commodity charts to understand what they are funding.",
    howItWorks: [
      "Start from producing nations and regional context, not commodity tickers alone.",
      "Layer conditions, flows, and signals the research framework names as hidden today.",
      "Compare nations and corridors side by side.",
      "Use the map as a thinking record for investment, policy, and community decisions.",
    ],
    insights: [
      "Research to instrument — the bet is that PhD-level frameworks should become something you can navigate, not just cite.",
      "Visibility before optimization — you cannot redesign an extractive system nobody can see.",
      "Community and capital — the same map has to speak to people living inside these economies and people allocating capital from outside them.",
    ],
  },
};

/** Modal hero subtitles + card blurbs — collaboration doc problem-first / .img grid. */
export const BUILD_PROJECT_COPY: Record<
  string,
  { subtitle: string; blurb: string; kicker: string; tech: string[] }
> = {
  leoney: {
    subtitle:
      "A platform helping the Sierra Leone diaspora build income at home, not just send it there.",
    blurb:
      "A platform helping the Sierra Leone diaspora build income at home, not just send it there. Combines an AI sourcing agent for reliable trade with China and a savings layer that redirects remittances into lasting infrastructure.",
    kicker: "Design · 5 Min Read",
    tech: ["Claude", "GPT", "Figma"],
  },
  pebble: {
    subtitle:
      "Homeschool moms aren't missing curriculum. They're missing someone else in the room at 8:47 on a hard morning.",
    blurb:
      "A shared morning rhythm for homeschool moms, not another curriculum tool. Built around a Circle, Session, Reflection loop so moms feel other families schooling alongside them instead of going it alone.",
    kicker: "Product · 4 Min Read",
    tech: ["Claude", "GPT", "Figma"],
  },
  gradstudio: {
    subtitle:
      "Design institutes have no way to support applicants at scale. Applicants have no structured way to build a case for themselves.",
    blurb:
      "A two-sided admissions-readiness platform connecting design institutes with the applicants trying to get in. Built from a decade of teaching design students in China.",
    kicker: "Education · 5 Min Read",
    tech: ["Claude", "GPT", "Figma"],
  },
  rookieball: {
    subtitle:
      "Recruiting isn't hard because athletes lack exposure. It's hard because most families don't know where they actually stand.",
    blurb:
      "An AI team helping student athletes understand their level, close the gap, and build a real path to college recruiting. Not another recruiting database, a development pathway.",
    kicker: "Product · 4 Min Read",
    tech: ["Claude", "GPT", "Figma"],
  },
  "sensespace-ai": {
    subtitle:
      "Design researchers were spending a week making sense of what they'd just heard. This cuts it to hours.",
    blurb:
      "An AI research tool built on a taxonomy of design methodology, cutting research analysis time by 70% across 50+ design teams. Turns raw interview transcripts into structured, traceable insight.",
    kicker: "Design research · 5 Min Read",
    tech: ["Claude", "GPT", "Figma"],
  },
  "deepsocal-agent": {
    subtitle:
      "Every new client engagement starts from zero. This agent means the agency's own expertise finally compounds.",
    blurb:
      "One AI system that grows a Southern California design agency and runs its clients through acquisition to referral. Built so agency expertise compounds instead of resetting with every engagement.",
    kicker: "Strategy · 4 Min Read",
    tech: ["Claude", "GPT", "Figma"],
  },
  "mineral-pulse": {
    subtitle:
      "Mineral Pulse extends PhD work into a working prototype, mapping mineral producing nations across Africa.",
    blurb:
      "Mineral Pulse extends my PhD work into a working prototype, mapping mineral producing nations across Africa so communities and investors can see conditions that are currently hidden.",
    kicker: "Research · 5 Min Read",
    tech: ["Claude", "GPT", "Figma"],
  },
};
