/**
 * Final About keyword expansion copy (seed + Sanity patches).
 * Source: Final Edits_faslebbiesite.docx — About section (Aug 2026).
 * Keep in sync with bio punctuation — expansions should not repeat the pill label.
 */
import type { AboutToken } from "../src/lib/content";

export const ABOUT_EXPANSIONS: Record<string, AboutToken[]> = {
  systems: [
    {
      t: "text",
      text: ", designing at multiple levels of scale (personal, team, strategy, product, org as system) through a long-term horizon, where no piece can be fixed in isolation from the rest",
    },
  ],
  "sustainable minerals": [
    {
      t: "text",
      text: ", where I ask how design decisions shape extractive systems and how those systems reshape the communities and ecologies around them, built on a decade of fieldwork in African mining communities and a PhD from Carnegie Mellon",
    },
  ],
  "AI as material": [
    {
      t: "text",
      text: ", not a feature you add but a material with properties and consequences a designer is responsible for understanding",
    },
  ],
  "Scalar design leadership": [
    {
      t: "text",
      text: ", six years of applied research into how design scales inside an organization, built on the principle that the org is your product, which means designing the conditions for people to do their best work, and tested at Meta, Consumer Reports, and MIT",
    },
  ],
  "Carnegie Mellon University": [
    {
      t: "text",
      text: ", where I lead undergraduate design studies, Persuasion on how design moves attitudes and behavior, and Place on how physical environments shape design decisions,",
    },
  ],
  "advisor at MIT GOV/LAB": [
    {
      t: "text",
      text: ", running co-design transition workshops that put government officials, civil society, and residents in the same room, then building the training so local teams can carry it without me.",
    },
  ],
  "SFK International and ACG Arts": [
    {
      t: "text",
      text: ", art academies that prepare Chinese students for design study abroad, where I run intensive summer studios on design studies alongside faculty from Parsons, RISD, and the RCA,",
    },
  ],
  "Njala University": [
    {
      t: "text",
      text: ", where I teach mineral design at the natural resources school, examining mineral systems within a design framework and the communities that depend on them,",
    },
  ],
  "recognized and awarded": [
    {
      t: "text",
      text: ", a Webby for user experience, the Carnegie Mellon Teaching Fellowship, the #NewMacy Cybernetics Prize for systems thinking, and the Strategic Design Excellence Award at Parsons,",
    },
  ],
  reader: [
    {
      t: "text",
      text: ", C.S. Lewis, Chimamanda Ngozi Adichie, Ta-Nehisi Coates, Donella Meadows, across transition design, systems literature, African futurism, theology, and fiction",
    },
  ],
  fan: [
    {
      t: "text",
      text: ", of Liverpool FC, of surfing and skating as lifestyle sports, and of Seinfeld",
    },
  ],
};
