import Nav from "@/components/Nav";
import BuildBody from "@/components/BuildBody";
import { getBuildPage } from "@/sanity/fetch";
import { buildFromSanity } from "@/lib/buildFromSanity";

// Build / Play Ground page. Content is Sanity-driven (buildPage singleton); the
// in-code copy in lib/build.ts is the fallback used when a field is empty.
export default async function BuildPage() {
  const content = buildFromSanity(await getBuildPage());
  return (
    <>
      <Nav dark />
      <BuildBody content={content} />
    </>
  );
}
