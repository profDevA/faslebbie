/**
 * Phone hero layout, picked from the mobile hero image's own size (Xian, Nov 26:
 * Fas adds new studies by Duplicate, so no per-slug code lists).
 *
 * - Phone export (Israel's 393×720 or 393×807 frame, any scale) → shown whole
 *   ("full frame"), and the landscape desktop hero from 768 instead of 1024
 *   (portrait art was 1.4 screens tall on iPad portrait — Census QA #5, Nov 25).
 * - Anything else (no mobile image, landscape art) → the 78vh cover crop, desktop
 *   hero from 1024 (Vuforia Chalk today).
 * - Top crop: opt-in by slug only. The 59px nav strip at the top of the frame is
 *   empty on some exports and holds art on others of the same size, so the size
 *   can't decide it; a new study is never cropped.
 */

/** width / height from a Sanity asset URL (`-{w}x{h}.`, or its `rect=` crop),
 *  so the hero reserves its box before the multi-MB PNG arrives — mobile QA
 *  R17: Vuforia Editor sat at 0 px on a first visit, then the page jumped
 *  633 px. CSS keeps `h-auto`, so the loaded image draws exactly as before. */
export function sanityUrlImageSize(url?: string) {
  const m =
    url?.match(/[?&]rect=\d+,\d+,(\d+),(\d+)/) ??
    url?.match(/-(\d+)x(\d+)\.\w+(?:\?|$)/);
  return m ? { width: Number(m[1]), height: Number(m[2]) } : {};
}

/** Height ÷ width of a phone export: 393×720 = 1.83, 393×807 = 2.05 (and a
 *  full 393×852 / 375×812 phone = 2.17). Square, 4:5, 2:3 and landscape art
 *  fall outside, as do very tall scroll captures. */
const PHONE_EXPORT_MIN_RATIO = 1.75;
const PHONE_EXPORT_MAX_RATIO = 2.25;

/** The mobile hero is a phone-shaped export (by the size in its Sanity URL). */
export function isPhoneHeroExport(url?: string) {
  const { width, height } = sanityUrlImageSize(url);
  if (!width || !height) return false;
  const ratio = height / width;
  return ratio >= PHONE_EXPORT_MIN_RATIO && ratio <= PHONE_EXPORT_MAX_RATIO;
}

/** The Oct 13 rule hides the top 59px of a whole-frame hero (the Figma frame's
 *  nav strip, under the site header). Opt-in since QA X6, Nov 25. Its top strip
 *  is empty on Coral, Design Assist, Experian, OC Links and FDE. Not cropped:
 *  Census (NEW YORK wordmark, QA #4), Circle (phone status bars from y 49, C6),
 *  Galderma (wordmark), and — Xian, Nov 25 "yes, go", the Census trade-off
 *  (56px taller at 375) — the five whose strip holds art: Acme (logo top), DVA
 *  (head), Memory Tubes (photo), OC Navigator (logo leaves), The AR Handbook
 *  (PTC logo). A new study is shown whole; add its slug here only if its strip
 *  is empty. */
export const MOBILE_HERO_TOP_CROP_SLUGS = new Set([
  "coral-health",
  "design-assist-ai",
  "experian-boost",
  "oc-links",
  "financial-data-exchange",
]);

export function mobileHeroLayout(slug: string, imageMobile?: string) {
  const fullFrame = isPhoneHeroExport(imageMobile);
  return {
    fullFrame,
    topCrop: fullFrame && MOBILE_HERO_TOP_CROP_SLUGS.has(slug),
  };
}
