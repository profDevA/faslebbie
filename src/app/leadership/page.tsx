import Nav from "@/components/Nav";
import LeadershipBody from "@/components/LeadershipBody";
import LeadershipWatermark from "@/components/LeadershipWatermark";
import { getAboutLogoSvgs } from "@/lib/logoSvgs";

const logoSvgs = getAboutLogoSvgs();

// Leadership page (Figma 354:747 / 504:3226) — two-column shell: portrait on the
// left, interactive prose + "Leadership Moments" on the right. On desktop the
// heading is the big "Leadership" watermark behind the content, which starts on
// top and recedes as the dimmed content brightens forward on scroll.
export default function LeadershipPage() {
  return (
    <>
      <Nav dark />
      <LeadershipWatermark />
      <LeadershipBody logoSvgs={logoSvgs} />
    </>
  );
}
