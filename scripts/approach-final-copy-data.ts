/** Approach copy — holistic Figma `2890:74211` (5 sections).
 *  Reveal panels reused from the earlier collaboration extract where the
 *  pill phrase still exists. Pills with no Figma/extract reveal use `""`
 *  (static grey chip, not a click-to-expand). */

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
          [
            "Design makes and unmakes",
            "It can create preferred outcomes. It can also dissent, dismantle, and repair. Most practice only claims the first half. Choosing which a situation calls for is the work.",
          ],
          ". Everything built in our world is a product of design, which means everything can be redesigned. I create systems that link products, stakeholders, and users. Every product has a ",
          [
            "choreography",
            "Who it is for and who it leaves out. Who makes it, and under what conditions. Who tests it, who puts it in someone's hands, how the product designs its users back, and where it goes when it dies.",
          ],
          ", and following it means working at ",
          [
            "multiple levels of scale",
            "The individual holding the object, the community around them, the neighborhood, the region, and eventually the planet that absorbs what is left. Most practitioners pick one and go deep. What a product does at one scale is rarely what it does at another.",
          ],
          ", on a long time horizon. That lens lets me see the benefits a design delivers to direct users, and the burdens it distributes to ",
          [
            "invisible stakeholders",
            "Beyond the direct users and the named actors. The person who mined the material, the community living beside where it was assembled, the region that absorbs it once it is obsolete. Every product distributes both benefit and burden, and whoever carries the burden is rarely in the room when it gets decided.",
          ],
          ", those who have no seat in the review and no vote on the roadmap.",
        ],
      },
    ],
  },
  {
    title: "How I Lead",
    blocks: [
      {
        parts: [
          "Most of the teams and institutions I work with are not stuck on capability. They are stuck on ",
          [
            "structure",
            "Most design failures are not talent failures. They are structure failures. The artifact, the product, the organization, and the system it sits inside are all designable, and the interesting problems live in the gaps between them, where no single discipline has clear ownership.",
          ],
          ". I lead by designing the conditions for my team to do their best work. In practice, that is my ",
          [
            "Scalar Leadership Approach",
            "Scale deep: Designing the people systems. Individual capability, team cohesion, psychological safety, operational resilience. Growth becomes predictable when it runs on rituals rather than goodwill: bi-weekly skill-building, cross-functional teardowns, learning portfolios that make progress visible. This is also where character gets built, which matters more than skill and takes longer. Scale wide: Designing the collaboration systems. Cross-functional accessibility, transparent documentation, service frameworks, distributed thinking. The goal is removing the black box: a service framework that lets partners self-diagnose what they need, research protocols that unblock teams working against engineering constraints. Scale up: Designing the organizational systems. Strategic influence, institutional integration, leadership engagement. This is where design stops being a service provider and becomes an operating system: the team as kernel, frameworks as libraries, processes as APIs. Success is measured by whether design input is embedded in how organizational decisions get made.",
          ],
          ", built from six years of applied research into how design scales inside an organization. It works across three levels, scale deep, scale wide, and scale up, each running across five dimensions: personal, product, team, strategy, company. Tested at ",
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
          ". Underneath it sit three principles: ",
          [
            "the org is your product",
            "Structure, roles, and rituals are design decisions. An organization is the most consequential thing a design leader makes and usually the least deliberately designed. You can prototype one the same way you prototype anything else. Six years of research and a decade of practice landed in the same place.",
          ],
          ", ",
          [
            "agency over efficiency",
            "Center the people inside the system, not the throughput of the system. Efficiency is easy to measure and easy to optimize toward, right up until it hollows out the thing it was meant to serve.",
          ],
          ", and ",
          [
            "character before craft",
            "Skill is teachable. Judgment, restraint, and the willingness to serve are what separate designers over a career. Both need training, and only one of them usually gets it.",
          ],
          ". Together they shape what I commit to and what I ask of the teams I lead.",
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
            "It is a research orientation I have published on. It is also just how I prefer to work.",
          ],
          ": inside the system rather than beside it, prototyping rather than observing, accountable to the people who live with the outcome and not only to the people who commissioned the work.",
        ],
      },
      {
        parts: [
          "My research background lets me find the ",
          [
            "real signal",
            "The raw, early, often ambiguous information everything else is built from. Interpreting field data to identify emerging needs, watching the startup ecosystem and academic research for what is forming. A signal is the input. Foresight is what you do with it once you have decided it matters. At PTC that meant reading the manufacturing floor instead of a research report, and finding a specific dollar figure in inefficiency directly from fieldwork.",
          ],
          " and turn it into evidence or ",
          [
            "foresight",
            "Reading an early signal correctly before it is obvious, and staying disciplined about the difference between something genuinely new and something that only looks new. Scenario planning, horizon scanning, futures mapping. Foresight without structure is a guess with confidence. The structure is what makes it foresight rather than intuition. At Franki that meant a two, five, and ten year go-to-market study. In the doctoral fieldwork it meant extractive systems and their futures.",
          ],
          ", which becomes product innovation or ",
          ["system change", ""],
          ". Then I build the ",
          [
            "operations",
            "The repeatable system, the ritual, the infrastructure that lets good decisions happen without you in the room. A handbook, a hub, a hiring rubric, a critique structure. It also makes explicit where design plugs into the rest of the business, because most organizational friction is not a skills gap, it is a relationship that was never built. At Meta: the design and research handbook, the Design Hub, the Dovetail system, and hiring rubrics for a function that did not exist yet. In Orange County: research on social determinants of health built into a crisis-response platform, which cut response times by 47 percent.",
          ],
          " that make it repeatable, staying close enough to the work to know when to pivot.",
        ],
      },
      {
        parts: [
          "Design is collaborative. I work with people, whose judgment I depend on, and with ",
          [
            "AI as a raw material",
            "It has properties and constraints a designer is responsible for understanding, the same as any material. The sequence matters: clarity first, then augmentation. The goal is a team that thinks more sharply with it, not one that has quietly outsourced the thinking.",
          ],
          ", whose properties I am responsible for understanding.",
        ],
      },
    ],
  },
  {
    title: "How We Could Work Together",
    static: true,
    blocks: [
      {
        subheading: "Embedded Design Leadership",
        parts: [
          "For teams at an inflection point: new direction, new scale, or a widening gap between what is being built and what it is for. Past the idea stage, before the operating model exists, no agreed metrics and no research system. I build the foundation while shipping the work in front of me.",
        ],
      },
      {
        subheading: "Advisory and Consulting",
        parts: [
          "For founders, institutions, governments, and universities who need a thinking partner. Someone to pressure-test strategy, name what is getting lost to velocity, and locate the structural problem behind the symptom. For organizations that inherited fragmentation, and for leaders working where the standard playbook does not reach: a regulated industry, a government system, a community most consultants will not go stand in. This extends to curriculum and program design in academic settings. Current and past: MIT GOV/LAB, Galderma, GIA, Parsons ELab, and Harvard Innovation Lab. Teaching appointments at Carnegie Mellon University, Njala University, and SFK International.",
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
          "For designers stepping into leadership, and for practitioners from underrepresented communities in design, technology, and the extractive sector. This work is free and always will be. Book here",
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
          "I am most useful when you are pre-product-market fit and need to know whether the idea survives. When you are at scale and the system underneath has to hold. When you are mid-transition, clear on where you are going and wanting a strategy you can carry. Or when there is no direction yet, and the work is figuring out what you value before you can act on it.",
        ],
      },
      {
        parts: [
          "If that is where you are, let's talk.",
        ],
      },
    ],
  },
];
