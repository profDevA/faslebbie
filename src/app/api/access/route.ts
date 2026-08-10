import { NextResponse } from "next/server";
import { client } from "@/sanity/client";
import { ACCESS_PASSWORD_QUERY } from "@/sanity/queries";

/**
 * Soft access gate (Fas 08/09). Checks the visitor's password against
 * Site Settings → Access password. The password never ships in page props —
 * only this server route reads it.
 */
export async function POST(req: Request) {
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  let expected = "";
  try {
    const data = await client.fetch<{ accessPassword?: string | null }>(
      ACCESS_PASSWORD_QUERY,
      {},
      { next: { revalidate: 30, tags: ["siteSettings"] } },
    );
    expected = (data?.accessPassword ?? "").trim();
  } catch {
    return NextResponse.json(
      { error: "Could not check the password right now." },
      { status: 500 },
    );
  }

  // No password configured — don't block (Fas still wiring Studio).
  if (!expected) {
    return NextResponse.json({ ok: true, configured: false });
  }

  if ((body.password ?? "").trim() === expected) {
    return NextResponse.json({ ok: true, configured: true });
  }

  return NextResponse.json(
    { ok: false, error: "Incorrect password." },
    { status: 401 },
  );
}
