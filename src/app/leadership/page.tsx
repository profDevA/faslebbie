import Nav from "@/components/Nav";
import LeadershipBody from "@/components/LeadershipBody";

// Leadership page (Figma 1-44995 / 1-45057 / 1-45118) — holistic ".txt" / ".img"
// design mirroring Work: a pinned "Leadership" watermark reveal over the prose
// (".txt"), and a masonry of moment cards (".img") that open the unified
// image / name / role / testimonial popup. The watermark is rendered inside
// LeadershipBody so it can force its receded state in the ".img" view.
export default function LeadershipPage() {
  return (
    <>
      <Nav dark />
      <LeadershipBody />
    </>
  );
}
