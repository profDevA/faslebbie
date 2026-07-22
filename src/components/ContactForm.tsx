"use client";

import { useState } from "react";
import Image from "next/image";

// "Drop Me a Line" contact form (Figma 16:45157). Centered portrait + heading,
// Name / Email* / Message* fields on translucent white inputs, and a black
// pill "Send Message" button. Posts to /api/contact (Resend).
type Status = "idle" | "submitting" | "success" | "error";

// Dark-panel styling: the drawer is black, so inputs use a translucent light
// fill with light text.
const inputClass =
  "w-full rounded-[7px] border border-white/15 bg-white/10 px-[15px] font-grotesk text-[16px] text-bg outline-none transition-colors placeholder:font-light placeholder:text-white/40 focus:border-white/45";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Something went wrong.");
      }
      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[440px] flex-col">
      {/* Portrait */}
      <div className="relative mx-auto h-[190px] w-[210px] overflow-hidden">
        <Image
          src="/contact-portrait.png"
          alt="Fas Lebbie"
          fill
          sizes="210px"
          className="object-cover object-top"
          priority
        />
      </div>

      <h1 className="mt-8 text-center font-grotesk text-[38px] font-bold leading-none tracking-[0.5px] text-bg sm:text-[44px]">
        Drop Me a Line
      </h1>

      {status === "success" ? (
        <div className="mt-10 rounded-[7px] border border-white/15 bg-white/5 px-5 py-8 text-center">
          <p className="font-grotesk text-[20px] font-medium text-bg">
            Thanks — your message is on its way.
          </p>
          <p className="mt-2 font-grotesk text-[15px] text-bg/60">
            Fas will get back to you at the email you provided.
          </p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            data-cursor="hover"
            className="mt-6 font-grotesk text-[15px] font-medium text-accent underline underline-offset-2"
          >
            Send another
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-9 flex flex-col gap-5" noValidate>
          <label className="flex flex-col gap-2">
            <span className="font-grotesk text-[16px] text-bg">Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              autoComplete="name"
              className={`${inputClass} h-[40px]`}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="font-grotesk text-[16px] text-bg">
              Email <span className="text-[#f56c6c]">*</span>
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              autoComplete="email"
              required
              className={`${inputClass} h-[40px]`}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="font-grotesk text-[16px] text-bg">
              Message <span className="text-[#f56c6c]">*</span>
            </span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message"
              required
              rows={4}
              className={`${inputClass} resize-y py-2.5 leading-normal`}
            />
          </label>

          {status === "error" && (
            <p className="font-grotesk text-[14px] text-accent">{error}</p>
          )}

          <button
            type="submit"
            disabled={status === "submitting"}
            data-cursor="hover"
            className="mt-1 h-[42px] w-fit rounded-[39px] bg-bg px-7 font-grotesk text-[16px] font-light text-black transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {status === "submitting" ? "Sending…" : "Send Message"}
          </button>
        </form>
      )}
    </div>
  );
}
