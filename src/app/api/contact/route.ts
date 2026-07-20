import { NextResponse } from "next/server";
import { Resend } from "resend";

// Contact form handler (Figma 16:45157 "Drop Me a Line"). Sends the visitor's
// message to Fas via Resend. Config comes from env:
//   RESEND_API_KEY       – required (resend.com)
//   CONTACT_TO_EMAIL     – where messages land (defaults to Fas's inbox)
//   CONTACT_FROM_EMAIL   – verified sender; onboarding@resend.dev works for
//                          testing but only delivers to the account owner.
export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "The contact form isn't configured yet." },
      { status: 500 },
    );
  }

  let body: { name?: string; email?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const message = (body.message ?? "").trim();

  if (!email || !message) {
    return NextResponse.json(
      { error: "Email and message are required." },
      { status: 400 },
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const resend = new Resend(apiKey);
  const to = process.env.CONTACT_TO_EMAIL ?? "dr.faslebbie@gmail.com";
  const from =
    process.env.CONTACT_FROM_EMAIL ?? "Portfolio Contact <onboarding@resend.dev>";

  try {
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `New message from ${name || email} — faslebbie.com`,
      text: `Name: ${name || "(not provided)"}\nEmail: ${email}\n\nMessage:\n${message}`,
    });
    if (error) {
      return NextResponse.json(
        { error: "Couldn't send your message. Please try again." },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Couldn't send your message. Please try again." },
      { status: 502 },
    );
  }
}
