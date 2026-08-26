/**
 * Move legacy images[1] into outputVisual + conceptPreview; keep images[0] as cover only.
 * Run once after adding the new modal image fields.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-build-popup-images-migrate.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

type ImageRef = {
  _type?: string;
  _key?: string;
  asset?: { _type?: string; _ref?: string };
};

type Project = {
  id?: string;
  images?: ImageRef[];
  outputVisual?: ImageRef;
  conceptPreview?: ImageRef;
  [k: string]: unknown;
};

async function main() {
  const page = await client.fetch<{ _id: string; projects?: Project[] } | null>(
    `*[_type == "buildPage"][0]{ _id, projects }`,
  );
  if (!page?._id) throw new Error("buildPage not found");

  let migrated = 0;
  const projects = structuredClone(page.projects ?? []).map((p) => {
    const cover = p.images?.[0];
    const legacy = p.images?.[1];
    const next = { ...p, images: cover ? [cover] : [] };

    if (legacy?.asset?._ref) {
      if (!next.outputVisual?.asset?._ref) {
        next.outputVisual = legacy;
        migrated += 1;
      }
      if (!next.conceptPreview?.asset?._ref) {
        next.conceptPreview = legacy;
      }
    }

    return next;
  });

  await client.patch(page._id).set({ projects }).commit();
  console.log(
    `✓ build popup images — migrated ${migrated} project(s); images[] is cover-only now`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
