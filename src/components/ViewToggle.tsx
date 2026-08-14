"use client";

/**
 * The dot-prefixed view switch shared by every listing page — ".txt / .img" on
 * Work, Build, Leadership and Teaching, ".blogs / .words / .media" on Blogs.
 *
 * Fas 07/28: these had drifted apart (Blogs was smaller, with a dimmed inactive
 * state and a different underline) — "blogs and media… it's different from
 * image, text, it's not consistent." One component now owns the styling so the
 * pages can't diverge again, and the labels are set in italics as he asked.
 *
 * Israel 07/02 link system: one colour throughout (no dimming), hover adds the
 * underline, the active view stays underlined.
 */
export default function ViewToggle<T extends string>({
  views,
  value,
  onChange,
  className = "",
}: {
  views: readonly T[];
  value: T;
  onChange: (next: T) => void;
  /** Spacing override for pages that sit the switch inside a padded wrapper. */
  className?: string;
}) {
  return (
    <div
      className={`relative z-20 flex items-center justify-center gap-10 pt-9 lg:pt-12 ${className}`}
    >
      {views.map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          data-cursor="hover"
          className={`font-grotesk text-[22px] font-medium italic leading-none text-black underline-offset-4 hover:underline lg:text-[27px] ${
            value === v ? "underline" : "no-underline"
          }`}
        >
          .{v}
        </button>
      ))}
    </div>
  );
}
