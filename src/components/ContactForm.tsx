"use client";

import { useState } from "react";
import Image from "next/image";

import { HOME_PORTRAIT_WIDTH } from "@/lib/portraitLayout";
import { useSite } from "@/components/SiteProvider";

// "Drop Me a Line" (Figma 2218:75548) — light drawer: portrait, heading,
// Name / Email* / Message* on translucent white inputs, black pill submit.
type Status = "idle" | "submitting" | "success" | "error";

const inputClass =
  "w-full rounded-[7px] border border-[#dadbdd] bg-white/70 px-[15px] font-grotesk text-[16px] text-black outline-none transition-colors placeholder:font-light placeholder:text-[#868e96] focus:border-black/40";

export default function ContactForm() {
  const { contact } = useSite();
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
    <div className="mx-auto flex w-full max-w-[420px] flex-col">
      {/* Figma 2647:3713 — same Home crop (161×145). */}
      <div className="relative mx-auto aspect-161/145 w-[161px] overflow-hidden">
        <Image
          src={contact.portraitSrc}
          alt="Fas Lebbie"
          fill
          sizes={`${HOME_PORTRAIT_WIDTH}px`}
          className="object-cover object-top"
          priority
        />
      </div>

      <h1 className="mt-11 text-center font-grotesk text-[38px] font-medium leading-none text-black sm:text-[44px]">
        {contact.heading}
      </h1>

      {status === "success" ? (
        <div className="mt-10 rounded-[7px] border border-[#dadbdd] bg-white/70 px-5 py-8 text-center">
          <p className="font-grotesk text-[20px] font-medium text-black">
            {contact.successTitle}
          </p>
          <p className="mt-2 font-grotesk text-[15px] text-black/60">
            {contact.successBody}
          </p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            data-cursor="hover"
            className="mt-6 font-grotesk text-[15px] font-medium text-accent underline underline-offset-2"
          >
            {contact.sendAnotherLabel}
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-9 flex flex-col gap-[18px]" noValidate>
          <label className="flex flex-col gap-1.5">
            <span className="font-grotesk text-[16px] text-black">Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              autoComplete="name"
              className={`${inputClass} h-[38px]`}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="font-grotesk text-[16px] text-black">
              Email <span className="text-[#f56c6c]">*</span>
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              autoComplete="email"
              required
              className={`${inputClass} h-[38px]`}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="font-grotesk text-[16px] text-black">
              Message <span className="text-[#f56c6c]">*</span>
            </span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message"
              required
              rows={4}
              className={`${inputClass} h-[98px] resize-none py-2.5 leading-normal`}
            />
          </label>

          {status === "error" && (
            <p className="font-grotesk text-[14px] text-accent">{error}</p>
          )}

          <button
            type="submit"
            disabled={status === "submitting"}
            data-cursor="hover"
            className="mt-1 h-[42px] w-fit rounded-[39px] border border-black bg-black px-7 font-grotesk text-[16px] font-light text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {status === "submitting" ? "Sending…" : contact.submitLabel}
          </button>
        </form>
      )}
    </div>
  );
}
