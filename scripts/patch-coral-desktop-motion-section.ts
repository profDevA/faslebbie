/**
 * Convert Coral Health's legacy `mediaSection` (Desktop Motion Showcase) to
 * `desktopMotionShowcase` (Figma 2019:104708 §08). Idempotent.
 *
 * Run from frontend/:
 *   sanity exec scripts/patch-coral-desktop-motion-section.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

const MARKETING_BODY =
  "Beyond the product experience, Coral Health required a public-facing website that communicated trust, educated employees and patients, and clearly articulated the company's mission before users ever entered the application.";

type MediaItem = {
  mediaType?: string;
  videoUrl?: string;
  videoFile?: { asset?: { _ref?: string } };
  caption?: string;
};

type Section = {
  _key: string;
  _type: string;
  sectionTitle?: string;
  body?: unknown;
  appearance?: unknown;
  items?: MediaItem[];
  videoUrl?: string;
  videoFile?: { asset?: { _ref?: string } };
  caption?: string;
  ctaLabel?: string;
  ctaUrl?: string;
};

async function main() {
  const doc: { _id: string; sections: Section[] } = await client.fetch(
    `*[_type == "caseStudy" && slug.current == "coral-health"][0]{
      _id,
      "sections": sections[]{
        _key, _type, sectionTitle, body, appearance,
        items[]{ mediaType, videoUrl, videoFile, caption },
        videoUrl, videoFile, caption, ctaLabel, ctaUrl
      }
    }`,
  );

  const i = doc.sections.findIndex((s) => s._type === "mediaSection");
  const done = doc.sections.some((s) => s._type === "desktopMotionShowcase");
  if (done && i < 0) {
    console.log("Already using desktopMotionShowcase.");
    return;
  }
  if (i < 0) {
    console.error("No mediaSection to convert on coral-health.");
    process.exit(1);
  }

  const cur = doc.sections[i];
  const first = cur.items?.[0];
  const videoFile = first?.videoFile ?? cur.videoFile;
  const videoUrl = first?.videoUrl ?? cur.videoUrl;
  const caption = first?.caption ?? cur.caption;

  const next: Section = {
    _key: cur._key,
    _type: "desktopMotionShowcase",
    sectionTitle: "Marketing Website",
    body: cur.body ?? [
      {
        _type: "block",
        _key: "marketing-body",
        style: "normal",
        markDefs: [],
        children: [{ _type: "span", _key: "marketing-span", text: MARKETING_BODY, marks: [] }],
      },
    ],
    appearance: cur.appearance,
    videoFile,
    videoUrl,
    caption,
    ctaLabel: cur.ctaLabel ?? "Visit Site",
    ctaUrl: cur.ctaUrl ?? "#",
  };

  const sections = [...doc.sections];
  sections[i] = next;

  await client.patch(doc._id).set({ sections }).commit();
  console.log(`→ converted section[${i}] mediaSection → desktopMotionShowcase ("Marketing Website")`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
