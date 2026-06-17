import { readFileSync } from "node:fs";
import { join } from "node:path";
import { aboutLogos } from "@/lib/content";

// Server-only: read each self-contained brand-logo SVG once so pages can pass
// the raw markup to <AboutContent>, which renders them inline (no <img>).
export function getAboutLogoSvgs() {
  return Object.fromEntries(
    Object.entries(aboutLogos).map(([name, { src }]) => [
      name,
      readFileSync(join(process.cwd(), "public", src), "utf8"),
    ]),
  ) as Record<keyof typeof aboutLogos, string>;
}
