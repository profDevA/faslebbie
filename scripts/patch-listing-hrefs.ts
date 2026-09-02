/**
 * Point Studio nav + home keyword hrefs at /casestudies and /approach.
 * Does not touch images or copy — href strings only.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-listing-hrefs.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

function rewriteHref(href: unknown): string | unknown {
  if (typeof href !== "string") return href;
  if (href === "/work" || href === "/works") return "/casestudies";
  if (href === "/leadership") return "/approach";
  const study = /^\/work\/([^/?#]+)$/.exec(href);
  if (study && !study[1].includes(".")) return `/casestudies/${study[1]}`;
  return href;
}

function rewriteLinkList(
  items: { href?: string }[] | undefined,
): { href?: string }[] | undefined {
  if (!items?.length) return items;
  return items.map((item) => ({
    ...item,
    href: typeof item.href === "string" ? (rewriteHref(item.href) as string) : item.href,
  }));
}

function rewriteMarks(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(rewriteMarks);
  if (!value || typeof value !== "object") return value;
  const rec = value as Record<string, unknown>;
  const next: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(rec)) {
    if (k === "href") next[k] = rewriteHref(v);
    else next[k] = rewriteMarks(v);
  }
  return next;
}

async function main() {
  const siteId: string | null = await client.fetch(
    `*[_type == "siteSettings"][0]._id`,
  );
  if (siteId) {
    const site = await client.getDocument(siteId);
    if (site) {
      await client
        .patch(siteId)
        .set({
          navItems: rewriteLinkList(site.navItems),
          mobileNavItems: rewriteLinkList(site.mobileNavItems),
          projectNavItems: rewriteLinkList(site.projectNavItems),
        })
        .commit();
      console.log(`patched ${siteId} nav hrefs`);
    }
  }

  const homeId: string | null = await client.fetch(
    `*[_type == "homePage"][0]._id`,
  );
  if (homeId) {
    const home = await client.getDocument(homeId);
    if (home?.hero) {
      await client.patch(homeId).set({ hero: rewriteMarks(home.hero) }).commit();
      console.log(`patched ${homeId} hero hrefs`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
