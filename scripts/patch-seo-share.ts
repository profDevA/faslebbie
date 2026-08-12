/**
 * Patch Site Settings SEO / Share — Figma 2632:1679 share preview + favicons.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-seo-share.ts --with-user-token
 */
import { createReadStream } from "node:fs";
import { resolve } from "node:path";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

const SITE_TITLE = "Fas Lebbie, Ph.D.";
const SITE_DESCRIPTION = "Designer · Researcher · Educator";

async function upload(
  relativePath: string,
  filename: string,
  contentType: string,
) {
  const path = resolve(process.cwd(), relativePath);
  const asset = await client.assets.upload("image", createReadStream(path), {
    filename,
    contentType,
  });
  console.log(`uploaded ${filename} → ${asset._id}`);
  return {
    _type: "image" as const,
    asset: { _type: "reference" as const, _ref: asset._id },
  };
}

async function main() {
  const id: string | null = await client.fetch(
    `*[_type == "siteSettings"][0]._id`,
  );
  if (!id) throw new Error("No siteSettings document");

  const [ogImageRef, faviconRef] = await Promise.all([
    upload("public/og-share.png", "og-share.png", "image/png"),
    upload("public/favicon.png", "favicon.png", "image/png"),
  ]);

  await client
    .patch(id)
    .set({
      siteTitle: SITE_TITLE,
      siteDescription: SITE_DESCRIPTION,
      ogTitle: SITE_TITLE,
      ogDescription: SITE_DESCRIPTION,
      ogImage: ogImageRef,
      ogImageAlt: "Fas Lebbie",
      favicon: faviconRef,
    })
    .commit();

  console.log(
    `✓ patched siteSettings SEO — "${SITE_TITLE}" / "${SITE_DESCRIPTION}" + OG + favicon`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
