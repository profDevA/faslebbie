"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { verifyAccessPassword } from "@/lib/access";

/**
 * Soft password popup (Fas 08/09 / live faslebbie.com). Shared by protected
 * case studies and About CV / Resume. Israel may restyle later — keep simple.
 */
export default function PasswordGate({
  open,
  message = "This content is password protected. To view it, please enter the password below.",
  onClose,
  onSuccess,
}: {
  open: boolean;
  message?: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setPassword("");
    setError(null);
    setBusy(false);
    const t = window.setTimeout(() => inputRef.current?.focus(), 40);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const result = await verifyAccessPassword(password);
    setBusy(false);
    if (!result.ok) {
      setError(result.error || "Incorrect password.");
      return;
    }
    onSuccess();
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Password protected"
      className="fixed inset-0 z-100 flex animate-[panel-in_0.2s_ease-out] items-center justify-center p-5 sm:p-10"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-pointer bg-[rgba(226,226,218,0.82)]"
      />
      <div className="relative w-full max-w-[440px] border-b-[6px] border-black bg-close px-7 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:px-10 sm:py-10">
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          data-cursor="hover"
          className="absolute right-4 top-4 text-[22px] leading-none text-black transition-opacity hover:opacity-60"
        >
          ✕
        </button>
        <p className="pr-8 font-grotesk text-[16px] font-medium leading-[1.45] text-black sm:text-[18px]">
          {message}
        </p>
        <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
          <label className="sr-only" htmlFor="access-password">
            Password
          </label>
          <input
            ref={inputRef}
            id="access-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full border border-black/20 bg-white px-4 py-3 font-grotesk text-[16px] text-black outline-none focus:border-black"
          />
          {error && (
            <p className="font-grotesk text-[14px] text-accent" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy || !password.trim()}
            data-cursor="hover"
            className="mt-1 bg-black px-5 py-3 font-grotesk text-[15px] font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-40"
          >
            {busy ? "Checking…" : "View"}
          </button>
        </form>
      </div>
    </div>,
    document.body,
  );
}
