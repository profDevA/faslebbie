/** Approach copy — collaboration doc (6) + Figma `2930:210988`. Five sections, 29 reveal panels. */

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
    blocks: [{ parts:
[
          ["Design makes and unmakes", "It can create preferred outcomes. It can also dissent, dismantle, and repair. Most practice only claims the first half. Choosing which a situation calls for is the work."],
          ". Everything built in our world is a product of design, which means everything can be redesigned. I create systems that link products, stakeholders, and users. Every product has a ",
          ["choreography", "Who it is for and who it leaves out. Who makes it, and under what conditions. Who tests it, who puts it in someone's hands, how the product designs its users back, and where it goes when it dies."],
          ", and following it means working at ",
          ["multiple levels of scale", "The individual holding the object, the community around them, the neighborhood, the region, and eventually the planet that absorbs what is left. Most practitioners pick one and go deep. What a product does at one scale is rarely what it does at another."],
          ", on a long time horizon. That lens lets me see the benefits a design delivers to direct users, and the burdens it distributes to ",
          ["invisible stakeholders", "Beyond the direct users and the named actors. The person who mined the material, the community living beside where it was assembled, the region that absorbs it once it is obsolete. Every product distributes both benefit and burden, and whoever carries the burden is rarely in the room when it gets decided."],
          ", those who have no seat in the review and no vote on the roadmap.",
        ]
    }],
  },
  {
    title: "How I Lead",
    blocks: [{ parts:
[
          "Most of the teams and institutions I work with are not stuck on capability. They are stuck on ",
          ["structure", "Most design failures are not talent failures. They are structure failures. The artifact, the product, the organization, and the system it sits inside are all designable, and the interesting problems live in the gaps between them, where no single discipline has clear ownership."],
          ". I lead by ",
          ["designing the conditions", "Leadership is as much the design of conditions as the direction of people. How decisions travel, who has agency, what gets rewarded, what gets ignored. Get those right and good work becomes the default rather than the exception."],
          " for my team to do their best work. In practice, that is my ",
          ["Scalar Leadership Approach", "Three levels, each one a system to be designed. Scale deep is the people systems: individual capability, team cohesion, psychological safety, operational resilience. Scale wide is the collaboration systems: documentation, service frameworks, protocols that let other functions self-serve. Scale up is the organizational systems, where design stops being a service and becomes infrastructure. Success at that level is measured by whether design input shows up in decisions made without you in the room. A framework is only a lens. There is no single set of rules that produces design success, which is why staying close to the craft matters as much as holding the framework."],
          ", built from six years of applied research into how design scales inside an organization. It works across three levels, ",
          ["scale deep", "Designing the people systems. Individual capability, team cohesion, psychological safety, operational resilience. Growth becomes predictable when it runs on rituals rather than goodwill: bi-weekly skill-building, cross-functional teardowns, learning portfolios that make progress visible. This is also where character gets built, which matters more than skill and takes longer."],
          ", ",
          ["scale wide", "Designing the collaboration systems. Cross-functional accessibility, transparent documentation, service frameworks, distributed thinking. The goal is removing the black box: a service framework that lets partners self-diagnose what they need, research protocols that unblock teams working against engineering constraints."],
          ", and ",
          ["scale up", "Designing the organizational systems. Strategic influence, institutional integration, leadership engagement. This is where design stops being a service provider and becomes an operating system: the team as kernel, frameworks as libraries, processes as APIs. Success is measured by whether design input is embedded in how organizational decisions get made."],
          ", each running across five dimensions: personal, product, team, strategy, company. Tested at ",
          ["Meta", "Repositioning design across fourteen product portfolios, from execution partner to strategic driver. I inherited a talented team that needed better infrastructure to scale its impact, and built the rituals, the service model, and the knowledge system that moved design from invisible execution to organizational infrastructure. The artifacts outlasted my tenure, which was the measure that mattered."],
          ", ",
          ["Consumer Reports", "Unifying six research teams into one coherent system. Transformed traditional research into agile, data-driven practice without losing the standard the organization was built on. A centralized platform accelerated insight generation by 30 percent and cut research-to-design cycles by 20 percent."],
          ", ",
          ["PTC", "Advancing AR and AI products used across more than forty industrial sites. Led UX strategy for tools serving over a million enterprise users. Field research across ten manufacturing facilities identified a million dollars in operational inefficiency and secured two million in funding for a real-time detection MVP."],
          ", and ",
          ["MIT GOV/LAB", "Helping civic institutions use design to address public challenges across two continents. Co-design workshops putting government officials, civil society, and residents in the same room, then building the training so local teams could carry it without me. The framework became replicable beyond its initial partner countries."],
          ". Underneath it sit three principles: ",
          ["the org is your product", "This is scale up, stated as a commitment rather than a level. Structure, roles, and rituals are design decisions, and an organization is the most consequential thing a design leader makes. It is also usually the least deliberately designed. Most organizations were not designed at all. They accumulated. You can prototype one the same way you prototype anything else, which is the premise the whole framework rests on."],
          ", ",
          ["agency over efficiency", "This is scale deep. Center the people inside the system, not the throughput of the system. Efficiency is easy to measure and easy to optimize toward, right up until it hollows out the thing it was meant to serve. A team that ships faster while its people lose judgment has not scaled. It has been drained."],
          ", and ",
          ["character before craft", "This is what scale deep is actually building. Skill is teachable and gets taught. Judgment, restraint, and the willingness to serve are what separate designers over a career, and they take longer to develop. Growth becomes predictable when it runs on rituals rather than goodwill, and character is what those rituals are for."],
          ". Together they shape what I commit to and what I ask of the teams I lead.",
        ]
    }],
  },
  {
    title: "How I Work & What I Make",
    blocks: [
      { parts:
[
          "I work as an ",
          ["embedded ally", "I work as an embedded ally inside the system rather than an observer of it, accountable to the people who live with the outcome, not only to the people who commissioned the work. It is a research orientation I have published on. In practice that means building provotypes to surface what people actually believe, and prototypes to validate a direction and test whether it works. More than that, it means being responsible for what my designs produce, and prioritizing the goals of users and communities over the intentions of the designer."],
          ": inside the system rather than beside it, prototyping rather than observing, accountable to the people who live with the outcome and not only to the people who commissioned the work.",
        ]
      },
      { parts:
[
          "My research background lets me find the ",
          ["signals", "The raw, early, often ambiguous information everything else is built from. A signal is the input. What you do with it once you have decided it matters is the work. At PTC that meant reading the manufacturing floor instead of a research report, and finding a specific dollar figure in inefficiency directly from fieldwork."],
          " and turn them into ",
          ["evidence or foresight", "Evidence is a structured argument that guides a decision and holds up when someone pushes back. The test is not that you have data, it is that you have built the framework connecting it to a specific recommendation. At Coral Health that meant a design KPI framework that moved the organization off engagement metrics and onto screening completion and trust. Foresight is reading an early signal correctly before it is obvious, and staying disciplined about the difference between something genuinely new and something that only looks new. Foresight without structure is a guess with confidence."],
          ", which becomes product innovation or ",
          ["system change", "Some contexts need the current model to end before a better one can start. A transition primer maps what has to be dismantled, what can be repaired, and what has to be built new, on a horizon longer than most projects allow. Developed for mineral systems in Sierra Leone. The logic transfers anywhere lock-in is the problem."],
          ". Then I build the operations that make it repeatable, staying close enough to the work to know when to pivot.",
        ]
      },
      { parts:
[
          "Design is collaborative. I work with people, whose judgment I depend on, and with ",
          ["AI as a raw material", "Working with people means understanding what they believe, what they are protecting, and what they will not say in the room. Their judgment is the thing you are building with. AI is different. It is a material with properties, constraints, and consequences, and the responsibility is to understand them rather than assume them. The sequence matters: clarity first, then augmentation. The goal is a team that thinks more sharply with it, not one that has quietly outsourced the thinking"],
          ", whose properties I am responsible for understanding.",
        ]
      },
    ],
  },
  {
    title: "How We Could Work Together",
    static: true,
    blocks: [
      {
        subheading: "Embedded Design Leadership",
        parts: ["For teams at an inflection point: new direction, new scale, or a widening gap between what is being built and what it is for. Past the idea stage, before the operating model exists, no agreed metrics and no research system. I build the foundation while shipping the work in front of me."],
      },
      {
        subheading: "Advisory & Consulting",
        parts: ["For founders, institutions, governments, and universities who need a thinking partner. Someone to pressure-test strategy, name what is getting lost to velocity, and locate the structural problem behind the symptom. For organizations that inherited fragmentation, and for leaders working where the standard playbook does not reach: a regulated industry, a government system, a community most consultants will not go stand in. This extends to curriculum and program design in academic settings. Current and past: MIT GOV/LAB, Galderma, GIA, Parsons ELab, and Harvard Innovation Lab. Teaching appointments at Carnegie Mellon University, Njala University, and SFK International."],
      },
      {
        subheading: "Talks and Workshops",
        parts: ["On design leadership, AI-driven product innovation, mineral-to-materials transitions, and systems thinking for resilient teams. Workshops run as working sessions rather than lectures, and usually produce something the team keeps."],
      },
      {
        subheading: "Mentoring and Coaching",
        parts: [
          "For designers stepping into leadership, and for practitioners from underrepresented communities in design, technology, and the extractive sector. This work is free and always will be. ",
          ["Book here", { contact: true }],
        ],
      },
    ],
  },
  {
    title: "Who I Work Best With",
    static: true,
    blocks: [
      { parts: ["I am most useful when you are pre-product-market fit and need to know whether the idea survives. When you are at scale and the system underneath has to hold. When you are mid-transition, clear on where you are going and wanting a strategy you can carry. Or when there is no direction yet, and the work is figuring out what you value before you can act on it."] },
      {
        parts: [
          "If that is where you are, ",
          ["let's talk", { contact: true }],
          ".",
        ],
      },
    ],
  },
];
