/**
 * Seed Site Settings chrome + SEO / Share from local assets + known copy.
 *
 * Run from frontend/:
 *   sanity exec scripts/patch-site-chrome.ts --with-user-token
 */
import { createReadStream } from "node:fs";
import { resolve } from "node:path";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

const SITE_TITLE = "Fas Lebbie, Ph.D.";
const SITE_DESCRIPTION =
  "Designer, researcher, educator — using design as a force for systems transition at scale.";

const navItems = [
  { _key: "home", _type: "navLink", label: "Home", href: "/" },
  { _key: "about", _type: "navLink", label: "About", href: "/about" },
  { _key: "case-studies", _type: "navLink", label: "Case Studies", href: "/work" },
  { _key: "build", _type: "navLink", label: "Build / Playground", href: "/build" },
  { _key: "approach", _type: "navLink", label: "Approach", href: "/leadership" },
  { _key: "research", _type: "navLink", label: "Research", href: "/research" },
  { _key: "teaching", _type: "navLink", label: "Teaching", href: "/teaching" },
  { _key: "words", _type: "navLink", label: "Words + Media", href: "/blogs" },
];

// Mobile keeps the same primary list (incl. Home); Projects stays desktop-only.
const mobileNavItems = navItems;

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

  const [portraitRef, faviconRef] = await Promise.all([
    upload("public/portrait-master.png", "portrait-master.png", "image/png"),
    upload("public/favicon.svg", "favicon.svg", "image/svg+xml"),
  ]);

  await client
    .patch(id)
    .set({
      // Chrome
      logoName: "Fas lebbie",
      logoSuffix: "Ph.D.",
      masterPortrait: portraitRef,
      // Nav
      navItems,
      mobileNavItems,
      // Contact (portrait comes from Brand → masterPortrait)
      contactDrawerTitle: "Contact",
      contactHeading: "Drop Me a Line",
      // SEO / Share
      siteTitle: SITE_TITLE,
      siteDescription: SITE_DESCRIPTION,
      favicon: faviconRef,
      ogTitle: SITE_TITLE,
      ogDescription: SITE_DESCRIPTION,
      ogImage: portraitRef,
      ogImageAlt: "Fas Lebbie",
    })
    .commit();

  console.log(`patched ${id}: chrome + nav + contact + SEO/Share`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
