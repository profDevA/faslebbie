import { config } from "dotenv";
import { createClient } from "@sanity/client";

config({ path: ".env.local" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2025-01-01",
  token: process.env.SANITY_API_READ_TOKEN,
  useCdn: false,
});

const HISTORY_TIME = "2026-08-26T07:59:00Z";

const resp = await client.request({
  uri: `/data/history/production/documents/cs-coral-health?time=${encodeURIComponent(HISTORY_TIME)}`,
  withCredentials: true,
});

const sections = resp.documents?.[0]?.sections ?? [];

for (const s of sections) {
  if (s._type === "overviewSection") {
    console.log("overview", {
      sideImage: !!s.sideImage?.asset,
      sideVideo: !!s.sideVideo?.asset,
      duration: s.duration,
      team: s.team,
      serviceList: s.serviceList,
    });
  }
  if (s._type === "problemContextSection") {
    console.log("problemContext", {
      problemHeading: s.problemHeading,
      broughtHeading: s.broughtHeading,
      problem0: s.problemBody?.[0]?.children?.[0]?.text?.slice(0, 80),
    });
  }
  if (s._type === "motionShowcase") {
    console.log("motion", { rows: s.rows?.length, title: s.sectionTitle });
  }
  if (s._type === "proseSection") console.log("prose", s.sectionTitle);
  if (s._type === "bulletSection") console.log("bullet", s.items);
}

console.log("section types:", sections.map((s) => s._type));
