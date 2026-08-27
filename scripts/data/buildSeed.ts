/** Patch / migrate seed only — runtime uses Sanity via buildFromSanity.ts. */

import type { BuildProject, BuildToken } from "../../src/lib/build";
import {
  BUILD_PROJECT_COPY,
  BUILD_PROJECT_DETAILS,
} from "./buildProjectDetails";

export const buildProjects: BuildProject[] = [
  {
    id: "leoney",
    title: "Leoney",
    span: "md",
    tint: "#17322c",
    ...BUILD_PROJECT_COPY.leoney,
    caseStudyDetail: BUILD_PROJECT_DETAILS.leoney,
  },
  {
    id: "pebble",
    title: "Pebble",
    span: "lg",
    tint: "#c9a892",
    ...BUILD_PROJECT_COPY.pebble,
    caseStudyDetail: BUILD_PROJECT_DETAILS.pebble,
  },
  {
    id: "gradstudio",
    title: "Gradstudio",
    span: "lg",
    tint: "#eef0ea",
    lightArt: true,
    ...BUILD_PROJECT_COPY.gradstudio,
    caseStudyDetail: BUILD_PROJECT_DETAILS.gradstudio,
  },
  {
    id: "rookieball",
    title: "Rookieball",
    span: "md",
    tint: "#9db3c4",
    ...BUILD_PROJECT_COPY.rookieball,
    caseStudyDetail: BUILD_PROJECT_DETAILS.rookieball,
  },
  {
    id: "sensespace-ai",
    title: "SenseSpace AI",
    span: "md",
    tint: "#545064",
    ...BUILD_PROJECT_COPY["sensespace-ai"],
    caseStudyDetail: BUILD_PROJECT_DETAILS["sensespace-ai"],
  },
  {
    id: "deepsocal-agent",
    title: "DeepSoCal Agent",
    span: "md",
    tint: "#2f3b4a",
    ...BUILD_PROJECT_COPY["deepsocal-agent"],
    caseStudyDetail: BUILD_PROJECT_DETAILS["deepsocal-agent"],
  },
  {
    id: "mineral-pulse",
    title: "Mineral Pulse",
    span: "sm",
    tint: "#eef0ea",
    lightArt: true,
    ...BUILD_PROJECT_COPY["mineral-pulse"],
    caseStudyDetail: BUILD_PROJECT_DETAILS["mineral-pulse"],
  },
];

export const buildIntro: BuildToken[][] = [
  [
    {
      t: "text",
      text: "The Playground is a living archive of small experiments: questions, observations, and experiments shaping how I think, and they are still expanding across branding, code, UI, motion, or illustration.",
    },
  ],
  [
    {
      t: "text",
      text: "Where they come from matters more than what they become.",
    },
  ],
  [
    {
      t: "text",
      text: "Necessity is the mother of innovation. Frustration is the father. Everything here started as one or the other, not as a gap in a market I went looking for.",
    },
  ],
  [
    { t: "text", text: "Some of it started at home. " },
    { t: "proj", id: "pebble", text: "Pebble" },
    {
      t: "text",
      text: " came from researching homeschooling for my son. Every tool on the market taught the child. Nothing helped the mom hold the morning together, so Pebble became a shared daily rhythm instead of another curriculum. ",
    },
    { t: "proj", id: "leoney", text: "Leoney" },
    {
      t: "text",
      text: " came from sending remittances to Sierra Leone and wanting that money to become something more durable: reliable access to goods despite a broken shipping infrastructure, and income streams that make remittances a choice instead of the only option. ",
    },
    { t: "proj", id: "rookieball", text: "Rookieball" },
    {
      t: "text",
      text: " came from watching my son play sports and thinking about what his game footage could become if it were captured as data from day one.",
    },
  ],
  [
    { t: "text", text: "Some of it started in the practice. " },
    { t: "proj", id: "gradstudio", text: "Gradstudio" },
    {
      t: "text",
      text: " came from a decade of teaching design students in China each summer and watching them treat my own path as a checklist. SenseSpace AI came from years of watching design teams drown in research data they didn't have time to make sense of. ",
    },
    { t: "proj", id: "deepsocal-agent", text: "DeepSoCal Agent" },
    {
      t: "text",
      text: " came from running client engagements across Southern California and getting tired of rebuilding context from zero every time.",
    },
  ],
  [
    { t: "text", text: "One came from research. " },
    { t: "proj", id: "mineral-pulse", text: "Mineral Pulse" },
    {
      t: "text",
      text: " extends my PhD work into a working prototype, mapping mineral producing nations across Africa so communities and investors can see conditions that are currently hidden.",
    },
  ],
  [
    {
      t: "text",
      text: "Not everything here is finished. Some of it is an idea I am still circling. This page is a thinking record, not a portfolio.",
    },
  ],
];
