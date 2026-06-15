import Nav from "@/components/Nav";
import V2Hero from "@/components/V2Hero";
import AboutContent from "@/components/AboutContent";

// Experimental aidesign-os-style homepage (Fas 06/14). Lives at /v2 alongside
// the current homepage at / so both can be compared on the live deploy.
// Scroll: name fades back → paragraph forward → About content continues below.
export default function V2Page() {
  return (
    <>
      <Nav dark />
      <main className="flex flex-1 flex-col">
        <V2Hero />
        <AboutContent />
      </main>
    </>
  );
}
