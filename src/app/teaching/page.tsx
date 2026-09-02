import type { Metadata } from "next";
import Nav from "@/components/Nav";
import TeachingBody from "@/components/TeachingBody";
import { pageMetadataFromSanity } from "@/lib/pageMetadata";
import { teachingFromSanity } from "@/lib/teachingFromSanity";
import { getSiteSettings, getTeachingPage } from "@/sanity/fetch";

// Teaching page. Content is Sanity-driven (teachingPage singleton) only.
// Query string is read on the server so the body is in the HTML. Client
// useSearchParams + <Suspense fallback={null}> left a blank shell until JS
// hydrated — Vercel hid it; slower EC2/nginx looked like a failed load.

export async function generateMetadata(): Promise<Metadata> {
  const [page, site] = await Promise.all([
    getTeachingPage(),
    getSiteSettings(),
  ]);
  return pageMetadataFromSanity(page?.seo, {
    title: "Teaching — Fas Lebbie, Ph.D.",
    description: site?.siteDescription?.trim(),
    ogImage: site?.ogImage,
    ogImageAlt: site?.ogImageAlt,
  });
}

export default async function TeachingPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; student?: string; all?: string }>;
}) {
  const params = await searchParams;
  const content = teachingFromSanity(await getTeachingPage());
  return (
    <>
      <Nav dark />
      <TeachingBody
        content={content}
        initialView={params.view ?? null}
        initialStudent={params.student ?? null}
        initialAll={params.all === "1"}
      />
    </>
  );
}
