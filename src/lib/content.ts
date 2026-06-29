// Homepage content — verbatim from the Figma prototype (docs/homepage-spec.md).

export type SectionId =
  | 'design'
  | 'research'
  | 'prototype'
  | 'teach'
  | 'mentor'
  | 'write'
  | 'lead'
  | 'advise'

export type HeroSegment =
  | { type: 'text'; text: string }
  | { type: 'keyword'; id: SectionId; text: string }
  | { type: 'story'; text: string }

export const heroSegments: HeroSegment[] = [
  { type: 'text', text: 'I ' },
  { type: 'keyword', id: 'design', text: 'design' },
  { type: 'text', text: ' digital product experiences and ' },
  { type: 'keyword', id: 'research', text: 'research' },
  {
    type: 'text',
    text: ' the material (minerals) and immaterial (AI) systems that enable them. With a maker-founder mindset, I ',
  },
  { type: 'keyword', id: 'prototype', text: 'prototype' },
  { type: 'text', text: ', ' },
  { type: 'keyword', id: 'teach', text: 'teach' },
  { type: 'text', text: ' and ' },
  { type: 'keyword', id: 'mentor', text: 'mentor' },
  { type: 'text', text: ', ' },
  { type: 'keyword', id: 'write', text: 'write' },
  { type: 'text', text: ', ' },
  { type: 'keyword', id: 'lead', text: 'lead' },
  { type: 'text', text: ', and ' },
  { type: 'keyword', id: 'advise', text: 'advise' },
  {
    type: 'text',
    text: ', helping teams and organizations use design as a force for systems transition at scale. ',
  },
  { type: 'story', text: "And there's more to my story+." },
]

export interface PanelContent {
  title: string
  body: string[]
  cta: { label: string; href: string }
  /** Tool-stack icon row — only the design panel has one in the prototype. */
  hasToolStack?: boolean
}

// The 14 design-tool logos (Figma 807:2982), each exported at 4x as its own
// transparent PNG (cream page background keyed out to a clean alpha matte) so
// they stay razor-sharp. They're drawn as CSS masks tinted with `currentColor`
// so they take the SAME colour as the wordmark (near-black at the top, fading
// to grey as it recedes). `w`/`h` are each glyph's native Figma size in px — we
// keep those exact proportions and per-icon heights instead of forcing them all
// to one height. TODO: swap for named brand SVGs once Fas confirms the list.
export const toolStackLogos: { src: string; w: number; h: number }[] = [
  { src: '/tools/stack/logo-01.png', w: 28.75, h: 28.0 },
  { src: '/tools/stack/logo-02.png', w: 18.75, h: 28.75 },
  { src: '/tools/stack/logo-03.png', w: 29.75, h: 29.75 },
  { src: '/tools/stack/logo-04.png', w: 29.5, h: 19.0 },
  { src: '/tools/stack/logo-05.png', w: 32.25, h: 32.25 },
  { src: '/tools/stack/logo-06.png', w: 25.5, h: 26.25 },
  { src: '/tools/stack/logo-07.png', w: 24.0, h: 24.25 },
  { src: '/tools/stack/logo-08.png', w: 28.0, h: 28.0 },
  { src: '/tools/stack/logo-09.png', w: 31.0, h: 30.5 },
  { src: '/tools/stack/logo-10.png', w: 28.75, h: 29.5 },
  { src: '/tools/stack/logo-11.png', w: 33.75, h: 32.25 },
  { src: '/tools/stack/logo-12.png', w: 28.75, h: 24.0 },
  { src: '/tools/stack/logo-13.png', w: 29.75, h: 29.75 },
  { src: '/tools/stack/logo-14.png', w: 32.25, h: 28.0 },
]

export const panels: Record<SectionId, PanelContent> = {
  design: {
    title: 'design',
    body: [
      'Designing products, systems, and experiences across enterprise software, AI, and civic infrastructure. From Meta to industrial field research — design as organizational leverage.',
    ],
    cta: { label: 'View Design Work', href: '/work' },
    hasToolStack: true,
  },
  research: {
    title: 'research',
    body: [
      'Researching mineral systems, AI infrastructures, and post-extractive futures through design.',
      'From African mining communities to enterprise AI, the work explores how systems shape people, ecologies, and transition.',
    ],
    cta: { label: 'Explore Research', href: '/research' },
  },
  prototype: {
    title: 'prototype',
    body: [
      'Prototyping ideas, interfaces, systems, and experimental workflows in public.',
      'A living playground of unfinished concepts, interactions, and emerging directions.',
    ],
    cta: { label: 'Enter Playground', href: '/build' },
  },
  teach: {
    title: 'teach',
    body: [
      'Teaching across Carnegie Mellon, MIT GOV/LAB, SFK International, and Njala University — treating the classroom as an active studio.',
      'Focused on systems thinking, product design, and real-world practice.',
    ],
    cta: { label: 'Continue to Teaching', href: '/teaching' },
  },
  mentor: {
    title: 'mentor',
    body: [
      'Mentoring emerging designers, researchers, and entrepreneurs across design, AI, and systems thinking.',
      'Focused especially on underrepresented communities navigating creative and technological futures.',
    ],
    cta: { label: 'Continue to Mentorship', href: '/teaching' },
  },
  write: {
    title: 'write',
    body: [
      'Writing about design systems, AI, leadership, extraction, and organizational transformation.',
      'Books, essays, journals, frameworks, and ongoing lines of inquiry.',
    ],
    cta: { label: 'Continue to Writing', href: '/blogs' },
  },
  lead: {
    title: 'lead',
    body: [
      'Leading design organizations across Meta, Consumer Reports, PTC, and MIT GOV/LAB.',
      'Building systems where design becomes infrastructure — not just output.',
    ],
    cta: { label: 'Continue to Leadership', href: '/leadership' },
  },
  advise: {
    title: 'advise',
    body: [
      'Advising organizations navigating AI transitions, design transformation, and systems change.',
      'Working across enterprise, civic innovation, and sustainable futures.',
    ],
    cta: { label: 'Continue to Advisory', href: '/leadership' },
  },
}

// ── About content (Figma 224:857 / 135:2260) ──────────────────────────────
// Tokens: "text" = plain; "role" = the designer/researcher/educator typer;
// "key" = red keyword on a gray pill (homepage style); "term" = black
// terminal-style tag with a >/~ prefix. Verbatim copy from the Figma frame.
export type AboutToken =
  | { t: 'text'; text: string }
  | { t: 'typer'; words: readonly string[] } // black >/~ tag that retype-cycles on click
  // "key" reveals copy on click. `tone` controls APPEARANCE — "red" = red
  // text/underline (no pill); "gray" = grey pill, black text; "gray-red" = grey
  // pill, red text (Figma 187:*). `opens` controls BEHAVIOUR — "inline" expands
  // purple continuation text in place; "panel" opens the boxed panel below the
  // line. Defaults: gray→inline, everything else→panel. (Set both to mix them,
  // e.g. a grey pill that opens a box.)
  | {
      t: 'key'
      text: string
      tone?: 'red' | 'gray' | 'gray-red'
      opens?: 'inline' | 'panel'
    }
  // "link" = gray rounded pill, red text — navigates to an internal page on
  // click (no popup/expansion). Figma "Component Interaction" 823:70182.
  | { t: 'link'; text: string; href: string }
  | { t: 'term'; text: string }
  | { t: 'logo'; name: keyof typeof aboutLogos }
  | { t: 'photo'; src: string; alt: string } // inline personal photo (hover-pops)

// Inline brand logos (Figma 187:1596). Each SVG is a self-contained chip — the
// colored background rect and internal padding are baked in — so they're
// rendered inline (no <img>, no wrapper background). `src` is relative to
// /public; the About page reads these files server-side and inlines them.
export const aboutLogos = {
  'carnegie-mellon': { src: '/about-logos/carnegie-mellon-university.svg' },
  parsons: { src: '/about-logos/parsons.svg' },
  utah: { src: '/about-logos/utah.svg' },
  frankl: { src: '/about-logos/franki.svg' },
  meta: { src: '/about-logos/meta.svg' },
  mastercard: { src: '/about-logos/mastercard.svg' },
  ptc: { src: '/about-logos/ptc.svg' },
  'consumer-reports': { src: '/about-logos/consumer-reports.svg' },
  'western-digital': { src: '/about-logos/western-digital.svg' },
  mit: { src: '/about-logos/mit.svg' },
} as const

// System 1 — the role is a single click-to-retype tag in the first sentence;
// the credentials are plain serif text with inline university logos (Figma
// 224:957). Only the role cycles. (Israel's 06-12 walkthrough implied a second
// credential typer, but the static frame is the source of truth — Xiang 06-16.)
export const roleWords = ['designer', 'researcher', 'educator']

// Retype-cycling >/~ tags — same component as the role tag. Labels verbatim
// from the Figma frames (2147236505 / 506 / 507).
export const sectorWords = [
  'Fintech.',
  'Enterprise Securities & Analytics',
  'Consumer Tech',
  'Healthcare',
  'Civic infrastructure.',
]
export const consultWords = [
  'design leadership',
  'AI systems',
  'civic systems',
  'sustainable transitions',
]
export const communityWords = [
  'underrepresented communities',
  'African creatives',
  'early-career technologists',
  'systems education',
]

// Gray keywords expand INLINE (purple text flows into the paragraph, per the
// Figma states 187:*). Each keyword maps to a token array; nested keywords are
// themselves expandable buttons. Only "sustainable minerals" has final copy;
// the rest are lorem until Fas writes them. TODO(Fas): final copy for LOREM.
const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
const lorem = (): AboutToken[] => [{ t: 'text', text: LOREM }]

export const aboutExpansions: Record<string, AboutToken[]> = {
  // The one with finalized copy — and it contains nested keyword buttons.
  'sustainable minerals': [
    {
      t: 'text',
      text: 'my research focuses on mineral exploration and mining design decisions, which tend to focus on economic and technical priorities. While social, ecological, and cultural values are increasingly acknowledged, they are still poorly understood and weakly embedded in decision-making across mining policies, practices, and processes. This knowledge gap results in mistrust, conflict, delay, and potential failure. To address this, my research investigates how ',
    },
    { t: 'key', text: 'design decisions', tone: 'gray' },
    { t: 'text', text: ' shape ' },
    { t: 'key', text: 'mineral systems', tone: 'gray' },
    {
      t: 'text',
      text: " — and how those systems, in turn, reshape communities, ecologies, and futures. For two decades, I've worked inside ",
    },
    { t: 'key', text: 'African mining communities', tone: 'gray' },
    { t: 'text', text: ', developing ' },
    { t: 'key', text: 'post-extractive frameworks', tone: 'gray' },
    {
      t: 'text',
      text: ' that center local knowledge and agency over extraction and profit. This work culminated in ',
    },
    { t: 'key', text: 'Mineral Choreography', tone: 'gray' },
    {
      t: 'text',
      text: ' — a new domain of inquiry establishing design as an active force within the ',
    },
    { t: 'key', text: 'extractive sector', tone: 'gray' },
    { t: 'text', text: ' and ' },
    { t: 'key', text: 'sustainability transitions', tone: 'gray' },
    {
      t: 'text',
      text: '. I am working directly with local communities — alongside engineers, policymakers, and scientists. I write about all of it across ',
    },
    { t: 'key', text: 'books', tone: 'gray' },
    { t: 'text', text: ', ' },
    { t: 'key', text: 'journals & articles', tone: 'gray' },
    { t: 'text', text: ', and ' },
    { t: 'key', text: 'academic work', tone: 'gray' },
    { t: 'text', text: '.' },
  ],
  // Top-level keywords (lorem until finalized)
  'recognized and awarded': lorem(),
  Product: lorem(),
  'Transition design': lorem(),
  'AI as material': lorem(),
  'Scalar Design Leadership': lorem(),
  reader: lorem(),
  fan: lorem(),
  'Carnegie Mellon University': lorem(),
  // Nested keywords inside the research passage (lorem until finalized)
  'design decisions': lorem(),
  'mineral systems': lorem(),
  'African mining communities': lorem(),
  'post-extractive frameworks': lorem(),
  'Mineral Choreography': lorem(),
  'extractive sector': lorem(),
  'sustainability transitions': lorem(),
  books: lorem(),
  'journals & articles': lorem(),
  'academic work': lorem(),
}

// Award marks shown in the "recognized and awarded" panel (Figma 187:2004).
// Each SVG is an isolated export with the panel-colour background baked in, so
// it sits flush on the panel. `h` is the Figma render height in px (widths vary,
// so we size by height and let width follow the aspect ratio).
export const aboutAwards = [
  {
    src: '/about-awards/new-macy.svg',
    alt: 'New Macy / ASC.Cybernetics',
    h: 22,
  },
  { src: '/about-awards/parsons.svg', alt: 'Parsons School of Design', h: 17 },
  { src: '/about-awards/webby.svg', alt: 'The Webby Awards', h: 27 },
  {
    src: '/about-awards/utah-challenge.svg',
    alt: 'Utah Entrepreneur Challenge',
    h: 20,
  },
  {
    src: '/about-awards/carnegie-mellon.svg',
    alt: 'Carnegie Mellon University',
    h: 17,
  },
] as const

// Keywords that open a BOXED panel (title, body, CTA, × close). No keyword
// currently uses one: "recognized and awarded" now expands inline, "monthly"
// and "teach" navigate to /teaching, and "what people are saying" uses the
// centered testimonials modal. Kept for when a boxed panel is designed.
export const aboutPanels: Record<
  string,
  {
    body: string[]
    cta?: { label: string; href: string }
    awards?: typeof aboutAwards
    placeholder?: boolean
  }
> = {}

export const aboutParagraphs: AboutToken[][] = [
  [
    { t: 'text', text: 'As a transdisciplinary ' },
    { t: 'typer', words: roleWords },
    { t: 'text', text: ' I hold a Phd in Design from ' },
    { t: 'logo', name: 'carnegie-mellon' },
    {
      t: 'text',
      text: "Carnegie Mellon University, a Master's in Design from ",
    },
    { t: 'logo', name: 'parsons' },
    {
      t: 'text',
      text: "Parsons School of Design and a Bachelor's in Entrepreneurship, ",
    },
    { t: 'logo', name: 'utah' },
    { t: 'text', text: 'University of Utah.' },
  ],
  [
    { t: 'text', text: 'I work at the intersection of ' },
    { t: 'key', text: 'Product', tone: 'gray' },
    { t: 'text', text: ' and ' },
    { t: 'key', text: 'Transition design', tone: 'gray' },
    { t: 'text', text: ', while my research focuses on ' },
    { t: 'key', text: 'sustainable minerals', tone: 'gray' },
    { t: 'text', text: ', ' },
    { t: 'key', text: 'AI as material', tone: 'gray' },
    { t: 'text', text: ', and ' },
    { t: 'key', text: 'Scalar Design Leadership', tone: 'gray' },
    { t: 'text', text: '.' },
  ],
  [
    { t: 'text', text: 'Currently Head of Design at ' },
    { t: 'logo', name: 'frankl' },
    { t: 'text', text: 'Franki. Previously led design across ' },
    { t: 'logo', name: 'meta' },
    { t: 'text', text: 'Meta, ' },
    { t: 'logo', name: 'mastercard' },
    { t: 'text', text: 'Mastercard/Finicity, ' },
    { t: 'logo', name: 'ptc' },
    { t: 'text', text: 'PTC, ' },
    { t: 'logo', name: 'consumer-reports' },
    { t: 'text', text: 'Consumer Reports, and ' },
    { t: 'logo', name: 'western-digital' },
    { t: 'text', text: 'Western Digital/SanDisk, working across ' },
    { t: 'typer', words: sectorWords },
  ],
  [
    { t: 'text', text: 'I ' },
    { t: 'link', text: 'teach', href: '/teaching' },
    { t: 'text', text: ' design at ' },
    { t: 'key', text: 'Carnegie Mellon University', tone: 'gray' },
    { t: 'text', text: ' and serve as a mentor and advisor at ' },
    { t: 'logo', name: 'mit' },
    {
      t: 'text',
      text: 'MIT GOV/LAB. My teaching extends internationally to SFK International and ACG Arts in China, and Njala University in Sierra Leone.',
    },
  ],
  [
    { t: 'text', text: 'My work has been ' },
    // Grey pill, black text — expands inline like the other grey keywords.
    { t: 'key', text: 'recognized and awarded', tone: 'gray' },
    {
      t: 'text',
      text: ' across product design, entrepreneurship, and academia. See ',
    },
    { t: 'key', text: 'what people are saying' },
    { t: 'text', text: '.' },
  ],
  [
    { t: 'text', text: 'I speak & consult on ' },
    { t: 'typer', words: consultWords },
    { t: 'text', text: ' and offer free mentorship ' },
    // Grey pill, red text — navigates to the Teaching / Mentorship page.
    { t: 'link', text: 'monthly', href: '/teaching' },
    { t: 'text', text: ' to ' },
    { t: 'typer', words: communityWords },
    { t: 'text', text: ' in design and tech.' },
  ],
  [
    { t: 'text', text: "Outside of the work, I'm a " },
    { t: 'key', text: 'reader', tone: 'gray' },
    { t: 'text', text: ', a ' },
    { t: 'key', text: 'fan', tone: 'gray' },
    { t: 'text', text: ', a husband and father ' },
    { t: 'photo', src: '/about-logos/father.png', alt: 'Fas with family' },
    { t: 'text', text: '.' },
  ],
]

// End-of-bio external links (Figma 807:19215–19234) — red text + ↗ arrow,
// underline on hover. These leave the site (CV/Resume files, LinkedIn, email).
export const aboutLinks = [
  { label: 'CV', href: '/cv.pdf' },
  { label: 'Resume', href: '/resume.pdf' },
  { label: 'Linkedin', href: 'https://www.linkedin.com/in/faslebbie/' },
  { label: 'Email', href: 'mailto:dr.faslebbie@gmail.com' },
] as const

// "What people are saying" — testimonials carousel (Fas 06/15: pop-up you can
// click "next" through, like case studies). Full set migrated from the live
// WordPress site (faslebbie.com/testimonials, Israel 06/24 — "get the rest from
// the live site… 16 of them"). Names normalised to Title Case.
// TODO(assets): real head-shots — every entry currently reuses avatar-1.png.
export const testimonials = [
  {
    quote:
      "I worked with Fas for almost exactly two years within Meta's Enterprise Infrastructure & Security Product/Design organization. Fas joined as a design manager and was absolutely instrumental in reshaping our design approach. Fas introduced advanced system design processes to the team and promoted consistency and standards across the org. He brings unique academic pedigree to the field and acts just as much of a teacher as he does a manager. His team was often digesting new learnings and concepts as part of his leadership approach. As I work cross-functionally in the org, the standardized approach to design became evident in a short matter of time as our interfaces, branding, and interactions all started aligning in application. Working with Fas was a privilege and I'm excited to see the next chapter in his career as he completes his dissertation and continues to contribute to the greater design community both professionally and academically.",
    name: 'J. Conor Sullivan',
    role: '- Content Manager, Meta',
    avatar: '/testimonials/avatar-1.png',
  },
  {
    quote:
      "Fas has been instrumental in accelerating my career growth. Under his leadership, our team transformed from a group of individual contributors to a cohesive and high-performing design team. Fas leverages his extensive knowledge and experience to constantly identify leadership opportunities for us, enabling impactful contributions beyond our immediate network and fostering individual growth aligned with our career ambitions. He methodically breaks down complex problems and develops frameworks that ensure simple yet strategic execution. All the while, Fas maintains realistic expectations, being mindful of our day-to-day obligations and thoughtfully adjusting his initiatives to better accommodate our needs. If you're finding your design team's growth stagnant or difficult to prove impact, I highly recommend Fas who can help teams grow and thrive. His leadership and expertise have made a significant impact on my career, and I am confident he will do the same for others.",
    name: 'Kenzo Makitani',
    role: '- Lead Product Designer, Meta',
    avatar: '/testimonials/avatar-1.png',
  },
  {
    quote:
      "Fas is an incredible designer. Talented and forward-thinking, he utilizes marketing insights, an entrepreneurial spirit, and mad skills to manifest ideas into tangible results. I've enjoyed working with Fas - he's motivated, very easy to work with, and open to suggestions which are highly valued traits in any organization.",
    name: 'Rich Nelson',
    role: '- Digital Marketing Leader, LifeWave Corporate',
    avatar: '/testimonials/avatar-1.png',
  },
  {
    quote:
      'I have had the pleasure of working closely with Fas over the past few years on his work in the mineral development and design industries. He constantly shows excellent intelligence and strategic vision which have been instrumental in guiding our projects towards success. Fas is not only adept at setting clear tasks for those who he manages, but also excels in fostering an environment where he can learn from the skills of those working with him.',
    name: 'Louis Hardiman',
    role: '- Staff Writer, History of War',
    avatar: '/testimonials/avatar-1.png',
  },
  {
    quote:
      'Fas was an exceptional manager and leader who oversaw the product design team with dedication. His significant contributions to the team were instrumental in setting a strong foundation for success and elevated the quality of product design outcomes. This included introducing design frameworks and methodologies to streamline processes, developing comprehensive design and research handbooks to guide best practices, and fostering a learning culture through mentorship, coaching, and workshops. Fas is also an inspirational leader and created a supportive environment for growth, innovation, and collaboration. It was a true blessing to have had Fas as part of the team, and his legacy continues to inspire future generations of designers and leaders.',
    name: 'Tori Lamb',
    role: '- Service Delivery Manager, Meta',
    avatar: '/testimonials/avatar-1.png',
  },
  {
    quote:
      "Fas leads through a lens of trust and collaboration. His selfless management style cultivates a culture of excellence, collective success, and inclusivity. Fas's knowledge on product strategy and team building creates an environment for organizational and personal growth that surpasses expectations.",
    name: 'Bo Jiang',
    role: '- Senior Product Designer, Meta',
    avatar: '/testimonials/avatar-1.png',
  },
  {
    quote:
      'I had the pleasure of working with Fas during our time together at Meta. As the design team manager, he consistently demonstrated exceptional leadership and a keen eye for user-centered design.',
    name: 'Jummy Abodunrin',
    role: '- Project Manager, Meta',
    avatar: '/testimonials/avatar-1.png',
  },
  {
    quote:
      "Fas's visionary leadership and strategic prowess drove exceptional results, fostering a collaborative and innovative environment. Under Fas's guidance, our team achieved significant milestones, and their dedication to fostering growth and innovation was truly inspiring. Fas is a leader who not only achieves results but also cultivates a culture of excellence and empowerment.",
    name: 'Mrugesh Patel',
    role: '- CTO',
    avatar: '/testimonials/avatar-1.png',
  },
  {
    quote:
      "Fas is a designer, entrepreneur, professor, and scholar, and a humble human-being. I have come to know him as a strong leader who inspires others to be their best and most creative selves. At Meta, he and I led initiatives to determine the customer journey for developer tools, learn more about developers' experiences, and propose improvements to product workflows and designs. For each step of the way, Fas established frameworks to obtain first-party user insights to guide product development and implemented best practices to improve our team's operational efficiency and standard of excellence. I'm proud to call Fas a colleague, mentor, and friend.",
    name: 'Anthony Walsh',
    role: '- Product Manager, Meta',
    avatar: '/testimonials/avatar-1.png',
  },
  {
    quote:
      'Fas\u2019s leadership style focuses on acting as a multiplier for the people on his team. He aligns the team through shared strategy and collaborative development of product, while giving individuals the opportunity to develop their own styles and voices.',
    name: 'Levi Soler',
    role: '- Content Designer, Meta',
    avatar: '/testimonials/avatar-1.png',
  },
  {
    quote:
      "Under Fas's guidance, I've grown significantly as a UX/UI designer. His blend of creativity and practicality inspires our team's success. Fas's visionary mentorship fosters an environment of excellence and innovation, making him a driving force behind our achievements.",
    name: 'Israel Adeleke',
    role: '- Snr. Product Designer, ThoughtCab',
    avatar: '/testimonials/avatar-1.png',
  },
  {
    quote:
      "Working under Fas Lebbie's guidance has been an invaluable learning journey. As a UX/UI designer, I've witnessed Fas's exceptional leadership firsthand. His mentorship, attention to detail, and commitment to excellence have shaped my growth over the past two years.",
    name: 'Yinka Jayeola',
    role: '- UI/UX Designer, ThoughtCab',
    avatar: '/testimonials/avatar-1.png',
  },
  {
    quote:
      "I had the pleasure of working with Fas Lebbie for 3 years and I can confidently say that he is an exceptional leader. His leadership style is a blend of strategic vision, empathy, and unyielding commitment to excellence. One of Fas Lebbie's standout qualities is his strategic vision. He has an uncanny ability to see the bigger picture and easily navigate complex challenges.",
    name: 'Virender Kumar',
    role: '- Web Developer/Designer',
    avatar: '/testimonials/avatar-1.png',
  },
  {
    quote:
      "Fas is a bright and outstanding individual. Teaming up with him and having him as a mentor for a startup to show me the ropes for someone who doesn't know anything about how to set up and run a successful start up, has been the best experience I've had. He's able to stay calm under pressure, and dig deep to find solutions to issues he comes across. He has an undying knack for UX design, and is highly driven to creating a user experience that's functional, versatile, and memorable for any customer that comes across his work. I would definitely recommend Mr. Lebbie to work as a UX designer for any company that is looking for pure talent, or even some sort of management position that allows him to grow more upon his ability to teach others like he did for me.",
    name: 'Justyn Ramirez',
    role: '- Strategic Marketing Expert x People Leader, Utah State University',
    avatar: '/testimonials/avatar-1.png',
  },
  {
    quote:
      'Fas is truly a unique professional and human being! His mind is quick and his thinking deep. He senses brand shifts almost immediately, operating at a very human level with clients and partners. I was blessed to be his client and his adjunct professor.',
    name: 'Mark Cook',
    role: '- Keynotes & Consulting, Windfall Partners',
    avatar: '/testimonials/avatar-1.png',
  },
  {
    quote:
      'Fas is a wonderful and outstanding guy to work with. His creative problem solving paired with outstanding social skills makes him a valuable asset to the team.',
    name: 'Sam Lagoy',
    role: '- Assistant Manager, Aloha Ski and Board Rental',
    avatar: '/testimonials/avatar-1.png',
  },
]

// ── Leadership page (Figma 354:747 / 354:1065) ────────────────────────────
// Same interactive-prose system as About (gray highlight pills + red boxed
// panels) plus a "Leadership Moments" accordion list. Gray pills here are
// highlights only — no inline expansion copy was designed (unlike About).

// Intro paragraph (gray pills: digital products / enterprise software / civic
// systems). "View portfolio" is a separate red panel line below it.
export const leadershipIntro: AboutToken[] = [
  { t: 'text', text: 'I design and build ' },
  { t: 'key', text: 'digital products', tone: 'gray' },
  { t: 'text', text: ' at the intersection of ' },
  { t: 'key', text: 'enterprise software', tone: 'gray' },
  { t: 'text', text: ', AI, and ' },
  { t: 'key', text: 'civic systems', tone: 'gray' },
  {
    t: 'text',
    text: ' — always with the belief that a well-crafted experience is the catalyst to evolve an entire workflow. A decade of work across Meta, Consumer Reports, PTC, and MIT GOV/LAB.',
  },
]

// Second paragraph (gray pills: strategic driver + the four orgs).
export const leadershipLead: AboutToken[] = [
  {
    t: 'text',
    text: 'I lead by designing the conditions for other people to do their best work — moving design from a service function to a ',
  },
  { t: 'key', text: 'strategic driver', tone: 'gray' },
  { t: 'text', text: '. At ' },
  { t: 'key', text: 'Meta', tone: 'gray' },
  {
    t: 'text',
    text: ' that meant repositioning design across 14 product portfolios. At ',
  },
  { t: 'key', text: 'Consumer Reports', tone: 'gray' },
  {
    t: 'text',
    text: ' it meant unifying six research teams into one coherent system. At ',
  },
  { t: 'key', text: 'PTC', tone: 'gray' },
  { t: 'text', text: ' it meant field research across 40 industrial sites. At ' },
  { t: 'key', text: 'MIT GOV/LAB', tone: 'gray' },
  { t: 'text', text: ' it meant civic design across two continents.' },
]

// Closing "What People Say" paragraph (gray pills: speak and present / consult /
// free mentorship). "Get in touch" is a red panel line below it.
export const leadershipClosing: AboutToken[] = [
  { t: 'text', text: 'Beyond organizational roles, I ' },
  { t: 'key', text: 'speak and present', tone: 'gray' },
  {
    t: 'text',
    text: ' on design leadership, AI, and sustainable futures — and I ',
  },
  { t: 'key', text: 'consult', tone: 'gray' },
  {
    t: 'text',
    text: ' with organizations navigating design transformation. I also offer ',
  },
  { t: 'key', text: 'free mentorship', tone: 'gray' },
  {
    t: 'text',
    text: ' to underrepresented communities in design, research, and entrepreneurship.',
  },
]

// Red boxed panels (same chrome as aboutPanels). "Get in touch" copy is a
// placeholder until Fas finalizes it.
export const leadershipPanels: Record<
  string,
  { body: string[]; cta?: { label: string; href: string }; placeholder?: boolean }
> = {
  'View portfolio': {
    body: [
      'Open the deeper work portfolio to see the product, systems, and organizational design work behind this leadership page.',
    ],
    cta: { label: 'Continue to portfolio', href: '/work' },
  },
  'Get in touch': {
    body: [
      'A decade building and scaling design organizations, navigating AI transitions, and working at the intersection of design and humans — let’s talk about what that work actually requires.',
    ],
    cta: { label: 'Continue to contact', href: '/contact' },
    placeholder: true,
  },
}

// "Leadership Moments" accordion (Figma 354:1065). Each role has a colored brand
// chip (reuses the About inline-logo SVGs), a meta line, and a headline. Only
// Meta has expansion copy + sub-links in the design; the rest are rows for now.
export const leadershipMoments: {
  logo: keyof typeof aboutLogos
  meta: string
  title: string
  sub?: string
  detail?: string[]
  links?: { label: string; href: string }[]
}[] = [
  {
    logo: 'meta',
    meta: 'Meta · 2022—2024 · Group Design Manager',
    title: 'Repositioning design as organizational infrastructure',
    detail: [
      '14 product portfolios. The challenge: moving design from Level 1 (producers) to Level 3 (strategic architects).',
      "Inherited a talented team that needed better infrastructure to scale its impact. Built Design Currency — repositioning the function as a strategic driver across Meta's Enterprise Infrastructure, Security & Analytics division.",
    ],
    links: [
      { label: 'Scale deep', href: '#' },
      { label: 'Scale wide', href: '#' },
      { label: 'Scale up', href: '#' },
    ],
  },
  {
    logo: 'consumer-reports',
    meta: 'Consumer Reports · Research Director',
    title: 'Unifying six research teams into one coherent system',
  },
  {
    logo: 'ptc',
    meta: 'PTC · Senior Product Designer',
    title: 'AR/AI at industrial scale — 1M+ users, 40 sites',
  },
  {
    logo: 'mit',
    meta: 'MIT GOV/LAB · Design Advisor',
    title: 'Civic design across two continents',
    sub: 'Co-designing innovation frameworks with African governments to repair government-citizen trust.',
  },
]

// ── Work / "Design Work" page (Figma 807:2954 / 823:65046 / 840:74764) ─────
// Same architecture as About: a giant "Design Work" watermark that recedes as
// the dimmed content brightens forward, a sticky portrait, and an interactive
// prose narrative — except here the red keywords are PROJECT NAMES. The page
// has two toggled views (".txt" = the narrative, ".img" = a masonry grid of
// project cards) and clicking any project opens a centred lightbox with
// Previous/Next (Figma 840:74764), mirroring the testimonials modal.

export type WorkCategory =
  | 'Product Design'
  | 'Design Research'
  | 'Design Technology'
  | 'Service Design'
  | 'Branding'

// Ordered category list for the "FILTER WORK" panel (Figma 823:67611). "All"
// is implicit (the default). Counts are derived from the project tags below.
export const workCategories: WorkCategory[] = [
  'Product Design',
  'Design Research',
  'Design Technology',
  'Service Design',
  'Branding',
]

// ── Case study (Figma 807:8804 / 807:11960 / 838:71331) ────────────────────
// Each project can open a full-screen, scrollable case-study overlay: a black
// hero (brand logo + curved photo), an OVERVIEW band (prose + VISIT SITE +
// "RESEARCH & DESIGN" meta beside a framed photo), a "WHAT I BROUGHT" section,
// and a black "PROBLEM STATEMENT". Only Coral Health is authored so far; the
// rest degrade gracefully to hero + tagline until Fas supplies their copy.
export interface CaseStudyMeta {
  /** Disciplines line, e.g. "Mixed-Methods User Research · Platform Design…". */
  disciplines: string
  duration: string
  team: string
  confidentiality?: string
}

/** A collapsible row (Figma: "WHAT I BROUGHT" / "DESIGN PROCESS" accordions). */
export interface CaseStudyAccordionItem {
  title: string
  body?: string
}

/** A headline metric tile (Figma stat band: "75% / Find & keep providers…"). */
export interface CaseStudyStat {
  value: string
  label: string
  note?: string
}

export interface CaseStudy {
  /** Caption under the hero logo. */
  caption: string
  /** "VISIT SITE" external link (omit to hide). */
  visitHref?: string
  /** OVERVIEW paragraph. */
  overview: string
  meta: CaseStudyMeta
  /** "WHAT I BROUGHT" (sage) — eyebrow + accordion (first item open). */
  brought?: { eyebrow: string; items: CaseStudyAccordionItem[] }
  /** Black "PROBLEM CONTEXT" prose (paragraphs split on blank lines). */
  problem?: string
  /** "MY APPROACH" (sage) — blurb + orange "DESIGN PROCESS" accordion. */
  approach?: { blurb: string; items: CaseStudyAccordionItem[] }
  /** Shared intro used by the gallery sections (real Coral copy). */
  interventions?: string
  /** Maroon "EMPOWERING…" callout — headline + body. */
  advocate?: { heading: string; body: string }
  /** Sage stat band. */
  stats?: CaseStudyStat[]
  /** Black "IMPACT" prose. */
  impact?: string
  /** Real hero / overview art when available (falls back to accent panels). */
  heroImage?: string
  overviewImage?: string
}

export interface WorkProject {
  slug: string
  name: string
  /** One-line descriptor shown in the grid/lightbox (verbatim, live site). */
  tagline: string
  categories: WorkCategory[]
  /** Placeholder brand colour until the real hero art is supplied. */
  accent: string
  /** Masonry card height tier so the grid varies like Figma 823:65046. */
  span: 'sm' | 'md' | 'lg'
  /** Real hero image when available (TODO(assets): migrate from live site). */
  image?: string
  /** Full case-study content (Figma 807:8804). Optional until authored. */
  caseStudy?: CaseStudy
}

// Credit line shown under every grid card (Figma 823:65046 placeholder names —
// real per-project credits pending from Fas).
export const WORK_CREDIT = 'Credit: Jane Doe, Sabrina Fessler, John Doe'

// The 17 projects (taglines verbatim from faslebbie.com/works). Category tags
// are a best-effort grouping — TODO(Fas): confirm the real category mapping
// (Figma counts All 33 / Product 25 / Research 18 / Tech 7 / Service 8 /
// Branding 4 don't line up with 17 projects, so some assignment is pending).
export const workProjects: WorkProject[] = [
  {
    slug: 'coral-health',
    name: 'Coral Health',
    tagline: 'Bridging healthcare disparities for underserved communities',
    categories: ['Product Design', 'Branding'],
    accent: '#ff5a3c',
    span: 'md',
    image: '/work/coral-health.png',
    caseStudy: {
      caption: 'Making quality healthcare accessible for underserved communities',
      visitHref: '#',
      overview:
        "In communities across America, finding healthcare providers who genuinely understand your background isn't just a preference; it's the difference between getting care or going without. Coral Health tackles this challenge by creating pathways that connect patients from underserved communities with culturally competent providers who understand their needs and experiences. As the only designer, I worked with the founding team and built the entire experience design system platform. The platform delivers smart matching technology and dedicated navigation support to its clients, helping over 75% of their users find and stick with providers they trust, improving healthcare accessibility and utilization among historically underserved groups.",
      meta: {
        disciplines:
          'Mixed-Methods User Research · Platform Design · Branding · Family Management Integration · Healthcare Equity Strategy',
        duration: 'March 2022–February 2023',
        team: 'Fas Lebbie, Patrick Wesonga, Dr. Fatima Cody Stanford, Dr. Chris T. Pernell',
        confidentiality:
          "This case study's insights and design process reflect my perspective and design approach. Specific details have been modified to protect sensitive information while showcasing my design approach.",
      },
      brought: {
        eyebrow: 'Project Overview · Baseline Information',
        items: [
          {
            title: 'Project Overview · Baseline Information',
            body: 'Initial assessment revealed that 65% of Black and 54% of Latinx adults report difficulty finding providers who share their background and experiences. Research showed that 77% of participants were somewhat or extremely satisfied with current healthcare providers.',
          },
          { title: 'Design Research & Strategy' },
          { title: 'Summary Of Findings' },
        ],
      },
      problem:
        'The data was stark, but the human reality was even heavier. In the U.S., 83% of health outcomes show worse results for Black patients compared to White patients, and Black women face 3× higher pregnancy-related mortality. Yet, the system often treats these disparities as inevitable.\n\nWe found that 65% of Black adults and 54% of Latinx adults struggle to find providers who understand their cultural backgrounds. This creates a cycle of mistrust: patients delay care, avoid screenings, and disengage until it is too late. The existing landscape offered them fragmented directories and cold clinical portals, forcing them to act as their own case managers in a system that didn\u2019t seem to see them.\n\nFor Coral Health, the challenge wasn\u2019t just technical; it was systemic and economic. We had to intervene upstream. Traditional primary care dependency was a major barrier because many employees of color didn\u2019t see PCPs regularly or faced \u201csurprise costs\u201d that eroded trust. We needed a design intervention that could bypass these systemic failures, offering a direct, transparent, and efficient pathway to early detection.',
      approach: {
        blurb:
          'Our design process followed a user-centered approach, beginning with extensive research among both patients and providers to understand healthcare access barriers. Through iterative development and continuous feedback from diverse stakeholder groups, we created a platform that addresses core cultural competency gaps in healthcare delivery. The process emphasized data-driven decision making while maintaining sensitivity to the complex cultural and social factors affecting healthcare access.',
        items: [
          {
            title: 'Project Overview · Baseline Information',
            body: 'Baseline data indicated that patients spend significant time searching through insurance provider directories, cross-referencing provider pictures, online reviews, and practice websites. This fragmented process creates substantial friction in healthcare access, particularly for underserved populations seeking culturally competent care.',
          },
          { title: 'Design Research & Strategy' },
          { title: 'Summary Of Findings' },
          { title: 'Prototyping & Implementation Strategy' },
        ],
      },
      interventions:
        'The design intervention targets patients from underserved communities who struggle finding culturally competent providers. Currently, 65% of Black adults and 54% of Latinx adults report difficulty finding providers who understand their experiences. The Coral Health digital platform uses matching algorithms to connect patients with culturally competent providers and provides navigation support. The platform connects patients with providers who understand their cultural context, and it provides engagement tools and resources so patients can make informed healthcare decisions. By streamlining cultural matching, 75% of users find and stick with trusted providers.',
      advocate: {
        heading: 'Empowering you to truly be their advocate.',
        body: 'Coral Health is an actionable way to embody your diversity, equity, and inclusion commitment by helping culturally-diverse people within your organization feel a sense of safety, understanding and belonging in healthcare situations.',
      },
      stats: [
        {
          value: '75%',
          label: 'Find & keep trusted providers',
          note: 'of users find and stick with culturally competent providers they trust.',
        },
        {
          value: '65%',
          label: 'Black adults',
          note: 'report difficulty finding providers who understand their experiences.',
        },
        {
          value: '54%',
          label: 'Latinx adults',
          note: 'report the same difficulty finding culturally competent care.',
        },
      ],
      impact:
        'By streamlining cultural matching and pairing it with dedicated navigation support, Coral Health helped over 75% of its users find and stick with providers they trust — improving healthcare accessibility and utilization among historically underserved groups, and shifting the relationship with care from transactional to genuinely supported.',
    },
  },
  {
    slug: 'snapback-lifestyle',
    name: 'Snapback Lifestyle',
    tagline: 'Artist & community-led brand storytelling',
    categories: ['Branding'],
    accent: '#f2c14e',
    span: 'lg',
    image: '/work/snapback-lifestyle.png',
  },
  {
    slug: 'life-of-a-miner-vr',
    name: 'Life of a Miner VR',
    tagline: 'Immersive design in becoming a miner',
    categories: ['Design Research', 'Design Technology'],
    accent: '#3f4756',
    span: 'sm',
    image: '/work/life-of-a-miner-vr.png',
  },
  {
    slug: 'experian-boost',
    name: 'Experian Boost',
    tagline: 'Reimagining Credit Access for Millions',
    categories: ['Product Design'],
    accent: '#5b2a86',
    span: 'sm',
    image: '/work/experian-boost.png',
  },
  {
    slug: 'diamond-valuation-ai',
    name: 'Diamond Valuation AI',
    tagline: 'AI design democratizing diamond valuation for miners',
    categories: ['Product Design', 'Design Technology'],
    accent: '#c9a227',
    span: 'md',
  },
  {
    slug: 'vuforia-chalk',
    name: 'Vuforia Chalk',
    tagline: 'Cross-platform AR design',
    categories: ['Design Technology', 'Product Design'],
    accent: '#6b46c1',
    span: 'md',
    image: '/work/vuforia-chalk.png',
  },
  {
    slug: 'vuforia-editor',
    name: 'Vuforia Editor',
    tagline: 'The Industrial Knowledge Studio',
    categories: ['Design Technology', 'Product Design'],
    accent: '#0f766e',
    span: 'sm',
  },
  {
    slug: 'design-assist-ai',
    name: 'Design Assist AI',
    tagline: 'AI UX Assistant for product designers',
    categories: ['Product Design', 'Design Technology'],
    accent: '#db2777',
    span: 'sm',
    image: '/work/design-assist-ai.png',
  },
  {
    slug: 'galderma',
    name: 'Galderma',
    tagline: 'Digital transformation of premium medical education',
    categories: ['Product Design', 'Service Design'],
    accent: '#be185d',
    span: 'md',
    image: '/work/galderma.png',
  },
  {
    slug: 'forever-a-surfer',
    name: 'Forever a Surfer',
    tagline: 'Transforming surf culture into social activism',
    categories: ['Design Research', 'Branding'],
    accent: '#2b6cb0',
    span: 'lg',
    image: '/work/forever-a-surfer.png',
  },
  {
    slug: 'the-ar-handbook',
    name: 'The AR Handbook',
    tagline:
      'Spare parts recognition for remote assistance in industrial manufacturing',
    categories: ['Design Technology'],
    accent: '#1e3a8a',
    span: 'md',
  },
  {
    slug: 'memory-tubes',
    name: 'Memory Tubes',
    tagline: 'Behavioral design research through provocative urban installations',
    categories: ['Design Research'],
    accent: '#4a7c59',
    span: 'sm',
  },
  {
    slug: 'acme-lending',
    name: 'Acme Lending',
    tagline: 'UX design streamlining income verification for lenders',
    categories: ['Product Design', 'Service Design'],
    accent: '#1f6feb',
    span: 'sm',
  },
  {
    slug: 'oc-links',
    name: 'OC Links',
    tagline:
      "Reducing response times for Orange County's digital mental health crisis management platform",
    categories: ['Service Design', 'Product Design'],
    accent: '#0891b2',
    span: 'md',
    image: '/work/oc-links.png',
  },
  {
    slug: 'oc-digital-resource-navigator',
    name: 'OC Digital Resource Navigator',
    tagline: 'Improving Mental Health Resource Access',
    categories: ['Service Design', 'Design Research'],
    accent: '#0ea5e9',
    span: 'lg',
    image: '/work/oc-digital-resource-navigator.png',
  },
  {
    slug: 'census-benefit-calculator',
    name: '2020 US Census Benefit Calculator',
    tagline:
      'Resource locator increasing Immigrant families census participation',
    categories: ['Service Design', 'Product Design'],
    accent: '#b45309',
    span: 'sm',
  },
  {
    slug: 'financial-data-exchange',
    name: 'Financial Data Exchange',
    tagline:
      'Designing industry standard for Open Banking through secure data sharing',
    categories: ['Product Design', 'Design Research'],
    accent: '#15803d',
    span: 'md',
    image: '/work/financial-data-exchange.png',
  },
]

// Tokens for the ".txt" narrative (Figma 807:2954). "project" = red underlined
// project name that opens the lightbox; "org" = red underlined company that has
// no case study (Western Digital / SanDisk) so it isn't clickable.
export type WorkToken =
  | { t: 'text'; text: string }
  | { t: 'project'; slug: string; text: string }
  | { t: 'org'; text: string }

const wp = (slug: string, text: string): WorkToken => ({ t: 'project', slug, text })

// Narrative paragraphs verbatim from Figma 807:2954.
export const workNarrative: WorkToken[][] = [
  [
    {
      t: 'text',
      text: 'I started my design career working across hardware, software, and consumer technology, helping shape products such as ',
    },
    wp('coral-health', 'Coral Health'),
    { t: 'text', text: ', ' },
    wp('snapback-lifestyle', 'Snapback Lifestyle'),
    { t: 'text', text: ', and ' },
    wp('experian-boost', 'Experian Boost'),
    { t: 'text', text: '. Early work with organizations including ' },
    { t: 'org', text: 'Western Digital' },
    { t: 'text', text: ', ' },
    { t: 'org', text: 'SanDisk' },
    { t: 'text', text: ', and ' },
    wp('acme-lending', 'Acme Lending'),
    {
      t: 'text',
      text: ' introduced me to the challenge of designing systems that build trust, simplify complexity, and connect digital experiences to real human needs.',
    },
  ],
  [
    {
      t: 'text',
      text: 'This foundation expanded into fintech and enterprise infrastructure through projects such as ',
    },
    wp('financial-data-exchange', 'Financial Data Exchange'),
    { t: 'text', text: ', ' },
    wp('oc-links', 'OC Links'),
    { t: 'text', text: ', and the ' },
    wp('census-benefit-calculator', '2020 US Census Benefit Calculator'),
    {
      t: 'text',
      text: ', where design became a tool for accessibility, inclusion, and large-scale decision making.',
    },
  ],
  [
    {
      t: 'text',
      text: 'My work later moved into emerging technologies, spatial computing, and AI-powered systems. Through projects such as ',
    },
    wp('vuforia-chalk', 'Vuforia Chalk'),
    { t: 'text', text: ', ' },
    wp('vuforia-editor', 'Vuforia Editor'),
    { t: 'text', text: ', ' },
    wp('design-assist-ai', 'Design Assist AI'),
    { t: 'text', text: ', ' },
    wp('diamond-valuation-ai', 'Diamond Valuation AI'),
    { t: 'text', text: ', and ' },
    wp('oc-digital-resource-navigator', 'OC Digital Resource Navigator'),
    {
      t: 'text',
      text: ', I explored how augmented reality, artificial intelligence, and human expertise can work together to improve learning, collaboration, and decision making. This period also produced knowledge-sharing initiatives such as ',
    },
    wp('the-ar-handbook', 'The AR Handbook'),
    {
      t: 'text',
      text: ', helping translate complex technical ideas into practical tools and frameworks for broader audiences.',
    },
  ],
  [
    {
      t: 'text',
      text: 'Alongside commercial work, I continued to pursue speculative, civic, and community-centred projects that examine how people understand and interact with systems. Projects such as ',
    },
    wp('life-of-a-miner-vr', 'Life of a Miner VR'),
    { t: 'text', text: ', ' },
    wp('forever-a-surfer', 'Forever a Surfer'),
    { t: 'text', text: ', ' },
    wp('memory-tubes', 'Memory Tubes'),
    { t: 'text', text: ', and ' },
    wp('galderma', 'Galderma'),
    {
      t: 'text',
      text: ' explored identity, health, memory, and lived experience through research-driven design. Together, these investigations informed later work including ',
    },
    wp('financial-data-exchange', 'Financial Data Exchange'),
    { t: 'text', text: ' and ' },
    wp('oc-links', 'OC Links'),
    {
      t: 'text',
      text: ', reinforcing a practice grounded in both technological innovation and human understanding.',
    },
  ],
  [
    {
      t: 'text',
      text: 'Across healthcare, fintech, enterprise systems, artificial intelligence, augmented reality, civic services, and speculative design, these projects reflect a consistent belief: design is most powerful when it helps people navigate complexity, build trust, and create meaningful change within the systems that shape everyday life.',
    },
  ],
]

// Desktop bar order + labels per the new Figma nav (854:79638): About, Work,
// Build, Leadership, Research, Teaching, Blogs / Media.
export const navItems = [
  { label: 'About', href: '/about' },
  { label: 'Work', href: '/work' },
  { label: 'Build', href: '/build' },
  { label: 'Leadership', href: '/leadership' },
  { label: 'Research', href: '/research' },
  { label: 'Teaching', href: '/teaching' },
  { label: 'Blogs / Media', href: '/blogs' },
]

// The mobile dropdown lists items in a different order than the desktop bar
// (Figma 187:3325): About, Work, Research, Build, Teaching, Leadership, Blogs.
export const mobileNavItems = [
  { label: 'About', href: '/about' },
  { label: 'Work', href: '/work' },
  { label: 'Research', href: '/research' },
  { label: 'Build', href: '/build' },
  { label: 'Teaching', href: '/teaching' },
  { label: 'Leadership', href: '/leadership' },
  { label: 'Blogs & Media', href: '/blogs' },
]
