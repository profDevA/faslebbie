import { NextResponse } from "next/server";
import { client } from "@/sanity/client";
import { ACCESS_PASSWORD_QUERY, STUDY_ACCESS_PASSWORD_QUERY } from "@/sanity/queries";

/**
 * Soft access gate (Fas 08/09). Checks the visitor's password against
 * Site Settings → Access password — or, when `slug` names a protected case
 * study with its own password (Studio → the study → "Own password", Fas
 * Nov 16 evening), against that one only. Passwords never ship in page
 * props — only this server route reads them.
 */
export async function POST(req: Request) {
  let body: { password?: string; slug?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  let expected = "";
  let scope: "study" | "site" = "site";
  try {
    const opts = { next: { revalidate: 30, tags: ["siteSettings"] } };
    const slug = typeof body.slug === "string" ? body.slug.trim() : "";
    const [site, study] = await Promise.all([
      client.fetch<{ accessPassword?: string | null }>(ACCESS_PASSWORD_QUERY, {}, opts),
      slug
        ? client.fetch<{ passwordProtected?: boolean; accessPassword?: string | null } | null>(
            STUDY_ACCESS_PASSWORD_QUERY,
            { slug },
            opts,
          )
        : Promise.resolve(null),
    ]);
    const own = study?.passwordProtected ? (study.accessPassword ?? "").trim() : "";
    if (own) {
      expected = own;
      scope = "study";
    } else {
      expected = (site?.accessPassword ?? "").trim();
    }
  } catch {
    return NextResponse.json(
      { error: "Could not check the password right now." },
      { status: 500 },
    );
  }

  // No password configured — don't block (Fas still wiring Studio).
  if (!expected) {
    return NextResponse.json({ ok: true, configured: false, scope });
  }

  if ((body.password ?? "").trim() === expected) {
    return NextResponse.json({ ok: true, configured: true, scope });
  }

  return NextResponse.json(
    { ok: false, error: "Incorrect password." },
    { status: 401 },
  );
}
