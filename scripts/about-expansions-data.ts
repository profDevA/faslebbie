/**
 * Final About keyword expansion copy (seed + Sanity patches).
 * Keep in sync with bio punctuation — expansions should not repeat the pill label.
 */
import type { AboutToken } from "../src/lib/content";

export const ABOUT_EXPANSIONS: Record<string, AboutToken[]> = {
  Product: [
    {
      t: "text",
      text: "I create systems of design that link products, stakeholders, and users to achieve meaningful experiences. Over the past decade that has run from zero to one up to enterprise scale: infrastructure, securities, open banking, industrial AR, civic tools. High-complexity domains where trust and organizational alignment matter as much as interface polish.",
    },
  ],
  "Systems design": [
    {
      t: "text",
      text: "Some of the biggest problems facing the world, war, hunger, poverty, and environmental degradation, are what Donella Meadows called system failures, where no piece can be fixed in isolation from the rest. Push on one part and the effect surfaces somewhere you were not looking, often years later. Products now carry the same character. They sit inside supply chains, institutions, and incentives that shape them long before anyone opens a design file, which is why the work needs a longer time horizon than most projects allow. What I design on a screen depends on what comes out of the ground, on the critical minerals that power every device. Holding both ends is what systems design means in my practice, and why it takes a transdisciplinary lens",
    },
  ],
  "sustainable minerals": [
    {
      t: "text",
      text: "Mineral exploration and mining decisions get made on economic and technical priorities. Social, ecological, and cultural values are acknowledged and then weakly embedded across mining policies, practices, and processes. That gap produces mistrust, conflict, delay, and failure. My research asks how design decisions shape mineral systems, and how those systems reshape the communities and ecologies around them. A decade of fieldwork in African mining communities and a PhD from Carnegie Mellon, developing post-extractive frameworks that center local knowledge and agency over extraction and profit. This work culminated in what I call mineral choreography, a new domain of inquiry establishing design as an active force within the extractive sector and sustainability transitions. The premise is that minerals are not passive raw material, they are active agents in transition, shaped by worldviews and power. Minerality at Scale is the tool that came out of it, tracing material trajectories from the individual and local up to the planetary. The work is co-designed with mining communities alongside engineers, policymakers, and scientists.",
    },
  ],
  "AI as material": [
    {
      t: "text",
      text: "AI is not a feature you add. It is a material with properties, constraints, and consequences a designer is responsible for understanding. Same as minerals. Paola Antonelli called it a new raw material for designers, and the question I keep working on is not what AI can do for design but what design can do for AI. In conversations with companies the pattern repeats: data science teams build things no user wants, design teams want things no one can build. My work sits in that gap. I am building a taxonomy of AI capabilities mapped to design research methodologies. I presented the argument at the Design Research Society in 2025. At Meta I built Design Assist AI on the same premise, internally to make a team faster and externally as product.",
    },
  ],
  "Scalar Design Leadership": [
    {
      t: "text",
      text: "I view leadership as an interactive system focused on resonant relationships through quality interactions. In practice, my Scalar Leadership Approach is founded on six years of applied research into how design scales, tested at Meta across fourteen product portfolios, at Consumer Reports, and at Franki. Three levels, each one a system to be designed. Scale deep (designing the people systems): individual capability, team cohesion, psychological safety, operational resilience. Scale wide (designing the collaboration systems): cross-functional accessibility, transparent documentation, service frameworks, distributed thinking. Scale up (designing the organizational systems): strategic influence, institutional integration, leadership engagement, where success is measured by whether design is embedded in how organizational decisions get made. Each level operates across five dimensions: personal, product, team, strategy, company. But a framework is only a lens. I still prototype and talk to customers, because credibility with a team comes from staying close to the craft.",
    },
  ],
  "Carnegie Mellon University": [
    {
      t: "text",
      text: "I teach undergraduate design studies. Persuasion, on how design moves attitudes and behavior. Place, on how physical environments shape design decisions. Plus two graduate seminars. My method is the LTP cycle: learn it, teach it, practice it. Students build theory, teach it to peers, then apply it until something real exists. The classroom is a studio. The work should never die on submission.",
    },
  ],
  advisor: [
    {
      t: "text",
      text: "At MIT GOV/LAB I advise on civic innovation with African governments, developing frameworks to repair trust between citizens and the state. I run co-design workshops that put officials, civil society, and residents in the same room, then build the training so local teams can carry it without me. The aim is policy design that is culturally grounded and rooted in lived experience, not imported.",
    },
  ],
  "Recognized and awarded": [
    {
      t: "text",
      text: "A Webby for user experience. The Carnegie Mellon Teaching Fellowship. The #NewMacy Cybernetics Prize for systems thinking. The Strategic Design Excellence Award at Parsons. The Utah Entrepreneurship Challenge. Industry and academy have recognized the same work.",
    },
  ],
  reader: [
    {
      t: "text",
      text: "C.S. Lewis, Chimamanda Ngozi Adichie, Ta-Nehisi Coates, Donella Meadows. Systems literature and African futurism, theology and fiction, often at the same time. I read to think slower than the work usually allows.",
    },
  ],
  fan: [
    {
      t: "text",
      text: "Liverpool FC, since I was a kid. I still play soccer myself. Seinfeld, which I grew up on and still watch. Surfing whenever the water allows, usually with my wife.",
    },
  ],
};
