/** Approach copy — Final Edits_faslebbiesite.docx (Aug 2026). Five sections, 24 reveal panels. */

export type ProsePart =
  | string
  | readonly [pill: string, expansion: string]
  | readonly [label: string, { contact: true }];

export type ApproachBlockDef = {
  subheading?: string;
  parts: ProsePart[];
};

export type ApproachSectionDef = {
  title: string;
  static?: boolean;
  blocks: ApproachBlockDef[];
};

export const APPROACH_SECTIONS: ApproachSectionDef[] = [
  {
    title: "My Approach",
    blocks: [
      {
        parts: [
          [
            "Design makes and unmakes",
            ", creating preferred outcomes, dissent, or repair across multiple actors, beginning from who the “design” is for and who it leaves out, to who makes it, who uses it, and where it goes when it dies",
          ],
          ", which means everything built in our world can be redesigned. That lens lets me see the benefits a design delivers to ",
          [
            "direct stakeholders",
            ", the people who commission the work and the people it is built for, founders, investors, and the users a product intends to serve",
          ],
          ", and the burdens it distributes to ",
          [
            "invisible stakeholders",
            ", the person who mined the material, the community living beside where it was assembled, the region that absorbs it once it is obsolete, those who have no seat in the review and no vote on the roadmap",
          ],
          ", at ",
          [
            "multiple scales",
            ", the individual holding the object, the community around them, the neighborhood, the region, and eventually the planet that absorbs what is left",
          ],
          ".",
        ],
      },
    ],
  },
  {
    title: "How I Lead",
    blocks: [
      {
        parts: [
          "I lead by ",
          [
            "designing the conditions",
            ", building design currency through craft and research until design has enough influence to change decisions, which is what lets me unstick the structures and unlock capabilities through team cohesion",
          ],
          " for my team to do their best work. In practice, that is my ",
          [
            "Scalar Leadership Approach",
            ", three levels, each a system to be designed: scale deep for the people systems, scale wide for the collaboration systems, and scale up for the organizational systems, where design stops being a service and becomes infrastructure",
          ],
          ", six years of applied research into building design currency and how design scales inside an organization, across five dimensions, each carrying a commitment I make and an ask in return: ",
          [
            "personal",
            ", individual growth, where character matters more than craft, since who you are becoming as you design shapes the work more than the level of your output, and where I commit to your wellbeing for a balanced approach to work while asking you to help me understand how you work best",
          ],
          ", ",
          [
            "product",
            ", the user experience itself, where I commit to elevating design craft as a strategic differentiator and ask you to own both your own growth and the external impact of your decisions",
          ],
          ", ",
          [
            "team",
            ", collective capability, where I commit to building autonomous, collaborative, continuously learning teams and ask you to protect time for both craft and each other",
          ],
          ", ",
          [
            "strategy",
            ", business-focused methodology, where I commit to positioning design as a driver of product strategy through research and future vision and ask you to articulate how your contributions shape it",
          ],
          ", and ",
          [
            "company",
            ", institutional integration and organizational maturity, where I commit to building design's influence across the whole organization and ask you to act as a collaborator, building the design currency that carries influence beyond pushing pixels",
          ],
          ". Tested at ",
          [
            "Meta",
            ", where I inherited a talented team that needed better infrastructure to scale its impact and built the rituals, the service model, and the knowledge system that moved design from invisible execution to organizational infrastructure",
          ],
          " across fourteen product portfolios, at ",
          [
            "Consumer Reports",
            ", where a centralized platform accelerated insight generation by 30 percent and cut research-to-design cycles by 20 percent without losing the standard the organization was built on",
          ],
          " across six research teams, and at ",
          [
            "MIT GOV/LAB",
            ", where co-design workshops put government officials, civil society, and residents in the same room, and the training was built so local teams could carry it without me",
          ],
          " with civic institutions on two continents.",
        ],
      },
    ],
  },
  {
    title: "How I Work & What I Make",
    blocks: [
      {
        parts: [
          "I work as an ",
          [
            "embedded ally",
            ", a research orientation I have published on, which in practice means building provotypes to surface what people actually believe and prototypes to validate a direction, and being responsible for what my designs produce rather than only for what I intended",
          ],
          ", prototyping solutions within a system instead of observing it, accountable to the people who live with the outcomes of my design. My research background brings the rigor to turn a ",
          [
            "real signal",
            ", the raw and often ambiguous information everything else gets built from, which at PTC meant reading the manufacturing floor instead of a research report and finding a specific dollar figure in inefficiency directly from fieldwork",
          ],
          " into ",
          [
            "evidence for foresight",
            ", evidence being an argument that holds up when someone pushes back, which at Coral Health meant a KPI framework that moved the organization off engagement metrics and onto screening completion and trust, and foresight being what that evidence then lets you see coming before it is obvious",
          ],
          ", then into ",
          [
            "product innovation or system change",
            ", where design research can be a vessel to activate new systems despite the ever-changing supply chains, institutions, market dynamics, and incentives that shaped our current systems. Donella Meadows called it “system failures”, where no piece can be fixed in isolation from the rest. Push one part, and the effect surfaces somewhere you weren't looking, often years later. Digital/physical products we design now share these characteristics of interconnectedness and require intentional design across multiple dimensions to create a connected intervention, with an iterative process of working with transdisciplinary teams. Some of my work in the extractive sector on minerals systems and large-scale enterprise product-service system designs continues to illustrate this",
          ],
          ". Success lets me build the operations that make it repeatable, staying close enough to the work to know when to pivot, enhance, or innovate. My use of ",
          [
            "AI as a raw material",
            ", whose properties I am responsible for understanding, learned rather than assumed, with clarity coming first and augmentation second, so a team thinks more sharply with it rather than quietly outsourcing the thinking",
          ],
          " follows the same premise, and my collaboration with people follows a systems lens, because ",
          [
            "collaborative co-design systems",
            ", an organized ecology of people, roles, tools, and decision-making processes where participants can frame, contest, and revise change over time, so a team is transforming the system while continually redesigning how it works together",
          ],
          " are what let anything meaningful get built.",
        ],
      },
    ],
  },
  {
    title: "How We Could Work Together",
    blocks: [
      {
        parts: [
          "I engage through ",
          [
            "embedded design leadership",
            "Embedded means I enlist with the internal team and am accountable for what ships. For teams at an inflection point: new direction, new scale, or a widening gap between what is being built and what it is for. I've thrived often past the idea stage but before the operating model exists, with no agreed metrics and no research system.",
          ],
          " for teams at an inflection point and offer ",
          [
            "advisory and consulting",
            ", where i use my transition design background to pressure-test strategy, name what is getting lost to velocity, and locate the structural problem behind the symptom in service of building transition frameworks towards systems-level change.",
          ],
          " for founders, institutions, and governments who need a thinking partner. Ongoing Current advisory includes: MIT GOV/LAB, Galderma, Parsons ELab, and InGenius Prep. I give ",
          [
            "talks and workshops",
            "On design leadership, AI-driven product innovation, mineral-to-materials transitions, and systems thinking for resilient teams, African futures, transition design, and scalar design leadership.",
          ],
          " that run as working sessions, and I typically offer ",
          [
            "mentor and coach",
            "For students, early-career designers, and entrepreneurs, with priority for practitioners from underrepresented communities in design, technology, and the extractive sector. Free, and always will be.",
          ],
          " students, designers, and entrepreneurs. ",
          ["Get in touch", { contact: true }],
        ],
      },
    ],
  },
  {
    title: "Who I Work Best With",
    static: true,
    blocks: [
      {
        parts: [
          "I am most useful when there is no direction yet, and the work is figuring out what you value before you can act on it. When you are pre-product-market fit and using deep research through forsighting to take bets. Additionally, when you are mid-transition, clear on where you are going and wanting a strategy you can carry at scale, and the system underneath has to hold. If any of these resonate, ",
          ["let's talk", { contact: true }],
          ".",
        ],
      },
    ],
  },
];
