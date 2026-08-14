import { redirect } from "next/navigation";

/** Legacy /build/[slug] links → listing overlay (?project=). */
export default async function BuildProjectRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/build?project=${encodeURIComponent(slug)}`);
}
