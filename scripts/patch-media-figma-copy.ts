/**
 * Patch blogsPage.media titles to Figma 2623:3908.
 * Keeps thumbs, video URLs, and uploaded files. Does not replace the array.
 *
 * Run from frontend/:
 *   sanity exec scripts/patch-media-figma-copy.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

const FIGMA = [
  {
    title:
      "Sustainable Jewelry: Artisanal Diamond Mining in Sierra Leone as a Means for Change",
    platform: "Living Room sessions",
    year: "2024",
  },
  {
    title: "Current Practice and Future of Strategic Design",
    platform: "Parsons School of Design Alumni Panel Series",
    year: "2024",
  },
  {
    title: "African Mineral Resources: Its Promises and Current",
    platform: "The Nordic Africa Institute",
    year: "2024",
  },
  {
    title: "Technology, Humanity, and Social Justice",
    platform: "University of Pittsburgh",
    year: "2023",
  },
  {
    title: "Leading Through a System Design Lens",
    platform: "MIT",
    year: "2023",
  },
  {
    title: "Sustainability and Design Alumni Engagement",
    platform: "parsons School of Design · Celebrate Parsons",
    year: "2023",
  },
  {
    title: "Innovations in Design Leadership",
    platform: "UCLA",
    year: "2023",
  },
  {
    title:
      "The Current State of Artisanal and Small Scale Diamond Mining",
    platform: "Chicago Jewelry Conference",
    year: "2022",
  },
] as const;

type MediaRow = {
  _key?: string;
  title?: string;
  platform?: string;
  year?: string;
  thumb?: unknown;
  video?: unknown;
  videoFile?: unknown;
};

async function main() {
  const doc = await client.fetch<{ _id: string; media?: MediaRow[] } | null>(
    `*[_type == "blogsPage"][0]{ _id, media }`,
  );
  if (!doc?._id) throw new Error("No blogsPage document");

  const before = doc.media ?? [];
  console.log(`before: ${before.length} media`);
  before.forEach((m, i) => console.log(`  ${i + 1}. ${m.title}`));

  if (before.length !== FIGMA.length) {
    throw new Error(
      `Expected ${FIGMA.length} media entries, found ${before.length}. Refusing to patch.`,
    );
  }

  const media = before.map((item, i) => {
    const f = FIGMA[i];
    return {
      ...item,
      title: f.title,
      platform: f.platform,
      year: f.year,
      source: f.platform,
      detail: `${f.platform} · ${f.year}`,
    };
  });

  await client.patch(doc._id).set({ media }).commit();

  console.log(`after: ${media.length} media (thumbs/videos unchanged)`);
  media.forEach((m, i) => console.log(`  ${i + 1}. ${m.title}`));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
