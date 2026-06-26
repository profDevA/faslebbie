import Nav from "@/components/Nav";
import WorkWatermark from "@/components/WorkWatermark";
import WorkBody from "@/components/WorkBody";

// Work / "Design Work" page (Figma 807:2954 / 823:65046 / 840:74764). Mirrors
// the About architecture: a big "Design Work" watermark recedes as the dimmed
// content brightens forward, with two toggled views (".txt" narrative + ".img"
// masonry grid) and a project lightbox. This static route overrides the generic
// `[section]` placeholder for /work.
export default function WorkPage() {
  return (
    <>
      <Nav dark />
      <WorkWatermark />
      <WorkBody />
    </>
  );
}
