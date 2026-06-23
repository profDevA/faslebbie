import Nav from "@/components/Nav";
import AboutBody from "@/components/AboutBody";
import AboutWatermark from "@/components/AboutWatermark";
import { getAboutLogoSvgs } from "@/lib/logoSvgs";

const logoSvgs = getAboutLogoSvgs();

// About page (Figma 807:19122 / 19414) — on desktop the heading is the big
// "About Me" watermark behind the content, which starts on top and recedes as
// the dimmed bio (left portrait + prose) brightens forward on scroll. Mobile
// keeps a small left-aligned heading. Dark nav matches the new design.
export default function AboutPage() {
  return (
    <>
      <Nav dark />
      <AboutWatermark />
      <AboutBody logoSvgs={logoSvgs} />
    </>
  );
}
