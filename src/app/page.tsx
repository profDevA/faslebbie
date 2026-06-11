import Nav from "@/components/Nav";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex flex-1 flex-col">
        <Hero />
      </main>
    </>
  );
}
