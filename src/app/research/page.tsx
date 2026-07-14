import Nav from "@/components/Nav";
import ResearchBody from "@/components/ResearchBody";
import ResearchWatermark from "@/components/ResearchWatermark";

// Research page (Figma "Faslebbie July Hollistic" 28fl2XqojJTa3jEblotAaz,
// frames 1-40936 → 1-41873). Mirrors the About/Leadership architecture: a big
// "Research" watermark recedes as the dimmed portrait + prose brighten forward,
// and red words open the paged "Minerals & Post-Extractive Design" modal
// (paradigms / principles / modalities / manifesto / field notes).
export default function ResearchPage() {
  return (
    <>
      <Nav dark />
      <ResearchWatermark />
      <ResearchBody />
    </>
  );
}
