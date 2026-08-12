/** Final Approach copy — source: docs/reference/approach-final-copy-extract.txt */

export type ProsePart = string | readonly [pill: string, expansion: string];

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
          "The entire world around us, and everything built within it, is a product of design. Which means everything built can be redesigned: added to, altered, or taken apart. ",
          [
            "Design makes and unmakes",
            "It can create preferred outcomes. It can also dissent, dismantle, and repair. Most practice only claims the first half. Choosing which a situation calls for is the work.",
          ],
          ".",
        ],
      },
      {
        parts: [
          "Most teams see their direct users. Harder to see are the ",
          [
            "invisible stakeholders",
            "Beyond the direct users and the named actors. The person who mined the material, the community living beside where it was assembled, the region that absorbs it once it is obsolete. Every product distributes both benefit and burden, and whoever carries the burden is rarely in the room when it gets decided.",
          ],
          " who have no seat in the review and no vote on the roadmap, and who the decisions land on anyway.",
        ],
      },
      {
        parts: [
          "Every product has a ",
          [
            "choreography",
            "Who it is for and who it leaves out. Who makes it, and under what conditions. Who tests it, who puts it in someone's hands, how the product designs its users back, and where it goes when it dies.",
          ],
          ", and following it means working at ",
          [
            "multiple levels of scale",
            "The individual holding the object, the community around them, the neighborhood, the region, and eventually the planet that absorbs what is left. Most practitioners pick one and go deep. What a product does at one scale is rarely what it does at another.",
          ],
          " at once. Design at one level and you optimize. Design across them and you start to see what you are making, and the benefits and burdens it distributes.",
        ],
      },
    ],
  },
  {
    title: "The Scalar Framework",
    blocks: [
      {
        parts: [
          "An organization is built, which means it was designed, which means it can be redesigned. Most were not designed deliberately. They accumulated.",
        ],
      },
      {
        parts: [
          "I lead by ",
          [
            "designing the conditions",
            "Leadership is as much the design of conditions as the direction of people. How decisions travel, who has agency, what gets rewarded, what gets ignored. Get those right and good work becomes the default rather than the exception.",
          ],
          " for other people to do their best work. Most of the teams and institutions I work with are not stuck on capability. They are stuck on ",
          [
            "structure",
            "Most design failures are not talent failures. They are structure failures. The artifact, the product, the organization, and the system it sits inside are all designable, and the interesting problems live in the gaps between them, where no single discipline has clear ownership.",
          ],
          ". Scalar is six years of applied research into how design scales inside an organization. Three levels, each one a system to be designed: ",
          [
            "scale deep",
            "Designing the people systems. Individual capability, team cohesion, psychological safety, operational resilience. Growth becomes predictable when it runs on rituals rather than goodwill: bi-weekly skill-building, cross-functional teardowns, learning portfolios that make progress visible. This is also where character gets built, which matters more than skill and takes longer.",
          ],
          ", ",
          [
            "scale wide",
            "Designing the collaboration systems. Cross-functional accessibility, transparent documentation, service frameworks, distributed thinking. The goal is removing the black box: a service framework that lets partners self-diagnose what they need, research protocols that unblock teams working against engineering constraints.",
          ],
          ", and ",
          [
            "scale up",
            "Designing the organizational systems. Strategic influence, institutional integration, leadership engagement. This is where design stops being a service provider and becomes an operating system: the team as kernel, frameworks as libraries, processes as APIs. Success is measured by whether design input is embedded in how organizational decisions get made.",
          ],
          ". Each runs across five dimensions: personal, product, team, strategy, company. Tested at ",
          [
            "Meta",
            "Repositioning design across fourteen product portfolios, from execution partner to strategic driver. I inherited a talented team that needed better infrastructure to scale its impact, and built the rituals, the service model, and the knowledge system that moved design from invisible execution to organizational infrastructure. The artifacts outlasted my tenure, which was the measure that mattered.",
          ],
          ", ",
          [
            "Consumer Reports",
            "Unifying six research teams into one coherent system. Transformed traditional research into agile, data-driven practice without losing the standard the organization was built on. A centralized platform accelerated insight generation by 30 percent and cut research-to-design cycles by 20 percent.",
          ],
          ", ",
          [
            "PTC",
            "Advancing AR and AI products used across more than forty industrial sites. Led UX strategy for tools serving over a million enterprise users. Field research across ten manufacturing facilities identified a million dollars in operational inefficiency and secured two million in funding for a real-time detection MVP.",
          ],
          ", and ",
          [
            "MIT GOV/LAB",
            "Helping civic institutions use design to address public challenges across two continents. Co-design workshops putting government officials, civil society, and residents in the same room, then building the training so local teams could carry it without me. The framework became replicable beyond its initial partner countries.",
          ],
          ".",
        ],
      },
    ],
  },
  {
    title: "My Design Principles",
    blocks: [
      {
        parts: [
          "Underneath the work, four commitments I do not negotiate: ",
          [
            "the org is your product",
            "Structure, roles, and rituals are design decisions. An organization is the most consequential thing a design leader makes and usually the least deliberately designed. You can prototype one the same way you prototype anything else. Six years of research and a decade of practice landed in the same place.",
          ],
          ", ",
          [
            "agency over efficiency",
            "Center the people inside the system, not the throughput of the system. Efficiency is easy to measure and easy to optimize toward, right up until it hollows out the thing it was meant to serve.",
          ],
          ", ",
          [
            "character before craft",
            "Skill is teachable. Judgment, restraint, and the willingness to serve are what separate designers over a career. Both need training, and only one of them usually gets it.",
          ],
          ", and ",
          [
            "context over process",
            "I do not have a fixed process or a preferred toolkit. Designers have more frameworks than any project needs. The discipline is reading the context first, then choosing what fits, rather than arriving with a method and looking for somewhere to apply it.",
          ],
          ".",
        ],
      },
    ],
  },
  {
    title: "How I Work",
    blocks: [
      {
        parts: [
          "I work at three altitudes: with a ",
          [
            "team",
            "Build intimacy and cohesion first, then become an embedded ally inside the team and across the org. The people closest to a problem are usually best equipped to solve it, so the job is building the system around them and staying close enough to the ground to know whether it is working.",
          ],
          ", at the ",
          [
            "org level",
            "Map the organizational problem before the product one. Build rough, disposable things to find out what is actually being decided. Name the question underneath the question, which is usually about power or value and rarely about interface.",
          ],
          ", and at the ",
          [
            "product level",
            "I start with two scenarios. What this looks like when it works, described as a scene rather than a feature list. And how it fails, and who it fails first. Most teams do the first. Fewer do the second, and the second is where the design lives. Then build something rough early enough that it can still be thrown away, before a team has spent three months defending a direction.",
          ],
          ". The questions change with the altitude, the discipline does not. I treat ",
          [
            "AI as a raw material",
            "It has properties and constraints a designer is responsible for understanding, the same as any material. The sequence matters: clarity first, then augmentation. The goal is a team that thinks more sharply with it, not one that has quietly outsourced the thinking.",
          ],
          " rather than a shortcut.",
        ],
      },
    ],
  },
  {
    title: "What I Make",
    blocks: [
      {
        parts: [
          "My outputs change with the context, but the cycle does not. Find the real ",
          [
            "signal",
            "The raw, early, often ambiguous information everything else is built from. Interpreting field data to identify emerging needs, watching the startup ecosystem and academic research for what is forming. A signal is the input. Foresight is what you do with it once you have decided it matters. At PTC that meant reading the manufacturing floor instead of a research report, and finding a specific dollar figure in inefficiency directly from fieldwork.",
          ],
          ". Turn it into ",
          [
            "evidence",
            "Turning research and observed signals into a structured argument that can guide a decision and hold up when someone pushes back. The test is not that you have data. It is that you have built the framework connecting that data to a specific recommendation, and the criteria a team keeps using after you leave. At Coral Health that meant a design KPI framework that moved the organization off engagement metrics and onto screening completion and trust. For the 2020 Census it meant research that reframed participation from civic duty to household benefit, for families with good reason to distrust the ask.",
          ],
          " or ",
          [
            "foresight",
            "Reading an early signal correctly before it is obvious, and staying disciplined about the difference between something genuinely new and something that only looks new. Scenario planning, horizon scanning, futures mapping. Foresight without structure is a guess with confidence. The structure is what makes it foresight rather than intuition. At Franki that meant a two, five, and ten year go-to-market study. In the doctoral fieldwork it meant extractive systems and their futures.",
          ],
          ", depending on who needs it. Build the ",
          [
            "operations",
            "The repeatable system, the ritual, the infrastructure that lets good decisions happen without you in the room. A handbook, a hub, a hiring rubric, a critique structure. It also makes explicit where design plugs into the rest of the business, because most organizational friction is not a skills gap, it is a relationship that was never built. At Meta: the design and research handbook, the Design Hub, the Dovetail system, and hiring rubrics for a function that did not exist yet. In Orange County: research on social determinants of health built into a crisis-response platform, which cut response times by 47 percent.",
          ],
          " that make it repeatable. Then ",
          [
            "stay close enough to the work",
            "Prototyping, shipping, being in the field, rather than only directing from above. This is the proof mechanism for the other four, which are only credible if you are close enough to know whether they are true rather than theoretically sound. It gets misread because of the PhD. I ran the entire doctorate alongside a full-time industry job, and I have stayed at the IC level at every stage of my career.",
          ],
          " to know whether any of it is still true.",
        ],
      },
      {
        parts: [
          "What gets handed over depends on what a team is missing: a ",
          [
            "state of the system",
            "Where the system is right now, and where it should be. Not a user journey but a system portrait: who it currently serves, who it currently costs, and what has to move for that to change. What it gives you is the underlying structure producing the outcomes rather than the outcomes themselves. The difference between fixing one broken thing and noticing that five broken things share a root cause.",
          ],
          ", a set of ",
          [
            "provotypes and prototypes",
            "Four different jobs, often confused for one. A provotype provokes and surfaces what people actually believe. A sacrificial idea gets put up to be killed, so the real objection comes out early. A prototype validates a direction. A final prototype tests whether the thing works. From there it scales through a maturity ladder, skateboard to scooter to motorcycle to car, with clear indicators at each stage that warrant the next one.",
          ],
          ", or a ",
          [
            "transition primer",
            "For contexts where the current model has to end before a better one can start. Developed for mineral systems in Sierra Leone. The logic transfers anywhere lock-in is the problem.",
          ],
          " for contexts where the current model has to end before a better one can start.",
        ],
      },
    ],
  },
  {
    title: "How We Could Work Together",
    static: true,
    blocks: [
      {
        parts: [
          "I work as an embedded ally: inside the system rather than beside it, accountable to the people who live with the outcome and not only to the people who commissioned the work. It is a research orientation I have published on. It is also just how I prefer to work.",
        ],
      },
      {
        subheading: "Embedded Design Leadership",
        parts: [
          "For teams at an inflection point: new direction, new scale, or a widening gap between what is being built and what it is for. Sometimes that means a team past the idea stage but before the operating model exists, with no metrics agreed on and no research system. I build the foundation while still shipping the work in front of me.",
        ],
      },
      {
        subheading: "Advisory",
        parts: [
          "For founders, institutions, governments, and universities who need a thinking partner rather than a deliverable. Someone to pressure-test strategy, name what is getting lost to velocity, and locate the structural problem behind the symptom. This extends to curriculum and program design in academic settings. Current and past: MIT GOV/LAB, Root Foundation, Parsons ELab, InGenius Prep, and visiting appointments at Njala University and SFK International.",
        ],
      },
      {
        subheading: "Consulting",
        parts: [
          "Through Thought Cab, the studio I founded, and independently. For organizations that inherited fragmentation, and for leaders working where the standard playbook does not reach: a regulated industry, a government system, a community most consultants will not go stand in. Past clients include Galderma on medical education at scale, Consumer Reports on research infrastructure, and Pact with GIA on artisanal mining standards.",
        ],
      },
      {
        subheading: "Talks and Workshops",
        parts: [
          "On design leadership, AI-driven product innovation, mineral-to-materials transitions, and systems thinking for resilient teams. Workshops run as working sessions rather than lectures, and usually produce something the team keeps.",
        ],
      },
      {
        subheading: "Mentoring and Coaching",
        parts: [
          "For designers stepping into leadership, and for practitioners from underrepresented communities in design, technology, and the extractive sector. This work is free and always will be.",
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
          "Designers and leaders who think in consequences. Who understand that one decision travels, that problems mutate rather than resolve, and that a fix at one scale can break something at another. Teams and organizations that treat equity and long-term thinking as what makes work durable rather than as drag on it.",
        ],
      },
      {
        parts: [
          "The moment varies. Some teams are pre-product-market fit and need to find out whether the idea survives contact with the world. Others are at scale and need the system underneath to hold. A few are mid-transition, clear on where they are going, wanting a toolkit they can carry themselves rather than a consultant they have to keep calling back. And some do not have a direction yet, and need to work out what they value before they can act on it.",
        ],
      },
      {
        parts: [
          "What connects them is a willingness to be changed by what we find. I am most useful while the question is still open, when what gets built and who it serves are both still up for argument. If that is where you are, let's talk.",
        ],
      },
    ],
  },
];
