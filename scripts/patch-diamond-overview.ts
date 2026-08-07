/**
 * Diamond Valuation AI is missing overviewSection (structure migration gap).
 * Inserts Overview after Hero using the Figma mobile still + generated copy.
 *
 *   sanity exec scripts/patch-diamond-overview.ts --with-user-token
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import { generatedCaseStudies } from "../src/lib/case-studies.generated";

const client = getCliClient({ apiVersion: "2025-01-01" });
const PUBLIC = join(process.cwd(), "public");
const key = () => randomUUID().replace(/-/g, "").slice(0, 12);
const hexColor = (hex: string, alpha = 1) => ({ _type: "color", hex, alpha });
const span = (text: string) => ({
  _type: "span",
  _key: key(),
  text,
  marks: [] as string[],
});
const block = (text: string) => ({
  _type: "block",
  _key: key(),
  style: "normal",
  markDefs: [],
  children: [span(text)],
});
function pt(text?: string) {
  if (!text) return undefined;
  return text
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((p) => block(p.replace(/\n/g, " ")));
}

const PHONE = "/work/diamond-valuation-ai/figma-mobile/overview-phone.png";
const OVERVIEW_BODY =
  "The app democratizes diamond valuation using AI-powered mobile technology that enables miners to independently assess rough diamonds, their market value, and potential yield analysis. The solution offers both online and offline smartphone scanning for live capture photography and videos, which are analyzed using AI to provide reliable market value estimates without Internet connectivity. The app prioritizes accessibility and usability for miners with limited technical knowledge by simplifying professional assessment principles into clear steps that anyone can follow.";

async function main() {
  const doc = await client.fetch<{ _id: string; sections: any[] } | null>(
    `*[_type == "caseStudy" && slug.current == "diamond-valuation-ai"][0]{ _id, sections }`,
  );
  if (!doc) throw new Error("diamond doc missing");

  if (doc.sections.some((s) => s._type === "overviewSection")) {
    console.log("overview already present — updating sideImage only");
  }

  const abs = join(PUBLIC, PHONE.replace(/^\//, ""));
  if (!existsSync(abs)) throw new Error(`missing ${PHONE}`);
  const asset = await client.assets.upload("image", createReadStream(abs), {
    filename: basename(abs),
  });
  console.log(`↑ ${asset._id}`);

  const g = generatedCaseStudies["diamond-valuation-ai"] as any;
  const overview = {
    _type: "overviewSection",
    _key: key(),
    sectionTitle: "Overview",
    body: pt(OVERVIEW_BODY),
    serviceCategoryLabel: "Research & Design",
    serviceList:
      "Participatory research · Mobile AI interface design · Offline-first UX · Equity-driven product strategy",
    duration: "Field research + product design (Sierra Leone)",
    team: "Fas Lebbie, Root Studios, Pact, GIA collaborators",
    sideImage: {
      _type: "image",
      asset: { _type: "reference", _ref: asset._id },
    },
    sideImageFit: "contain",
    sideImageBackgroundColor: hexColor("#1A1A1A"),
    ctaLabel: "Visit Site",
    ctaUrl: "#",
  };

  const sections = [...doc.sections];
  const existing = sections.findIndex((s) => s._type === "overviewSection");
  if (existing >= 0) {
    sections[existing] = { ...sections[existing], ...overview, _key: sections[existing]._key };
  } else {
    const heroIdx = sections.findIndex((s) => s._type === "heroSection");
    sections.splice(heroIdx >= 0 ? heroIdx + 1 : 0, 0, overview);
  }

  // Ensure problem/what-I-brought prose exists if missing (keep existing if present).
  if (!sections.some((s) => s._type === "proseSection" && /problem/i.test(s.sectionTitle ?? ""))) {
    console.log("(no problem section — leaving structure as-is)");
  }
  void g;

  await client.patch(doc._id).set({ sections }).commit();
  console.log(`✓ patched ${doc._id}`);
}

main();
