import Nav from "@/components/Nav";
import TeachingBody from "@/components/TeachingBody";
import { getTeachingPage } from "@/sanity/fetch";
import { teachingFromSanity } from "@/lib/teachingFromSanity";

// Teaching page. Content is Sanity-driven (teachingPage singleton); the in-code
// copy in lib/teaching.ts is the fallback used when the document/field is empty.
export default async function TeachingPage() {
  const content = teachingFromSanity(await getTeachingPage());
  return (
    <>
      <Nav dark />
      <TeachingBody content={content} />
    </>
  );
}
