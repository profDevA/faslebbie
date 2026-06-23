import Nav from "@/components/Nav";
import V2Hero from "@/components/V2Hero";

// Homepage (Figma 807:2527 / 2588) — the aidesign-os-style parallax hero Israel
// signed off on 06/22: the "Fas lebbie / Ph.D." wordmark starts on top, then
// fades and recedes behind as the interactive paragraph comes forward. Keywords
// navigate straight to their page; "more to my story+" goes to About.
export default function Home() {
  return (
    <>
      <Nav dark />
      <main className="flex flex-1 flex-col">
        <V2Hero />
      </main>
    </>
  );
}
