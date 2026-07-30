import { readFileSync } from "node:fs";
import { join } from "node:path";
import { aboutLogos } from "@/lib/content";

// Server-only: read each self-contained brand-logo SVG so About can inline the
// markup (hover-wobble needs real SVG DOM, not <img>).
//
// Paths are listed explicitly (not built only from `aboutLogos.src`) so Next's
// file tracer can see them — paired with `outputFileTracingIncludes` for
// `public/about-logos/**` in next.config.ts. Returning "" on miss used to hide
// a Vercel deploy bug where all of `public/` was excluded from the bundle.

const LOGO_FILES: Record<keyof typeof aboutLogos, string> = {
  "carnegie-mellon": "carnegie-mellon-university.svg",
  parsons: "parsons.svg",
  utah: "utah.svg",
  frankl: "franki.svg",
  meta: "meta.svg",
  mastercard: "mastercard.svg",
  ptc: "ptc.svg",
  "consumer-reports": "consumer-reports.svg",
  "western-digital": "western-digital.svg",
  mit: "mit.svg",
};

const LOGO_DIR = join(process.cwd(), "public", "about-logos");

export function getAboutLogoSvgs() {
  return Object.fromEntries(
    Object.entries(LOGO_FILES).map(([name, file]) => {
      try {
        return [name, readFileSync(join(LOGO_DIR, file), "utf8")];
      } catch (err) {
        console.error(`[about-logos] missing ${file}`, err);
        return [name, ""];
      }
    }),
  ) as Record<keyof typeof aboutLogos, string>;
}
