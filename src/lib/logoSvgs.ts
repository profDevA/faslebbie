import { readFileSync } from "node:fs";
import { join } from "node:path";
import { aboutLogos } from "@/lib/content";

// Server-only: read each self-contained brand-logo SVG once so pages can pass
// the raw markup to <AboutContent>, which renders them inline (no <img>). This
// runs at build time during static prerender. `public/` is excluded from the
// serverless function bundle (see next.config.ts), so guard the read: a cold
// function start must not throw if the files aren't present.
export function getAboutLogoSvgs() {
  return Object.fromEntries(
    Object.entries(aboutLogos).map(([name, { src }]) => {
      try {
        return [name, readFileSync(join(process.cwd(), "public", src), "utf8")];
      } catch {
        return [name, ""];
      }
    }),
  ) as Record<keyof typeof aboutLogos, string>;
}
