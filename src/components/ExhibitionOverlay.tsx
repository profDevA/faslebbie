"use client";

import PopupShell from "@/components/PopupShell";
import type { ExhibitionTile } from "@/lib/teaching";

// SFK Beijing Exhibition overlay (Figma 280-4632) — opened from the ".txt"
// "Explore my student exhibitions" CTA. Tiles come from Sanity only.
export default function ExhibitionOverlay({
  open,
  onClose,
  onViewStudents,
  title = "",
  tiles = [],
}: {
  open: boolean;
  onClose: () => void;
  onViewStudents: () => void;
  title?: string;
  tiles?: ExhibitionTile[];
}) {
  if (!open) return null;

  // Title often comes as one line ("SFK Beijing Exhibition"); split for the
  // two-line serif treatment when it has a natural break after "Beijing".
  const titleLines = title.replace(/\s+Exhibition$/i, "\nExhibition").split("\n");

  const centre = (
    <div className="flex flex-col items-center gap-6 text-center">
      <h2 className="font-serif text-[clamp(36px,6vw,64px)] font-medium leading-[1.05] text-black">
        {titleLines.map((line, i) => (
          <span key={i}>
            {i > 0 ? <br /> : null}
            {line}
          </span>
        ))}
      </h2>
      <button
        type="button"
        onClick={onViewStudents}
        data-cursor="hover"
        className="bg-black px-6 py-3 font-grotesk text-[13px] font-medium uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-80"
      >
        View Student Works
      </button>
    </div>
  );

  return (
    <PopupShell
      onClose={onClose}
      label={title}
      crumbs={[{ label: "Teaching", hideOnMobile: true }, { label: title }]}
      // The desktop collage is a fixed-height composition; only mobile scrolls.
      bodyClassName="min-h-0 flex-1 overflow-y-auto lg:overflow-hidden"
    >
      {/* Desktop: scattered collage with the title centred over it */}
      <div className="@container-size relative hidden h-full w-full lg:block">
        {tiles.map((tile, i) => (
          <div
            key={i}
            style={{
              top: `${tile.pos.top}%`,
              left: `${tile.pos.left}%`,
              // Sized off the container height (not the viewport) so the collage
              // keeps its proportions inside the popup card.
              width: `${(tile.pos.w * 1.87).toFixed(2)}cqh`,
              backgroundColor: tile.tint,
              backgroundImage: tile.image ? `url(${tile.image})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            className="absolute aspect-4/3 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
          />
        ))}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {centre}
        </div>
      </div>

      {/* Mobile: title on top, then a simple grid */}
      <div className="lg:hidden">
        <div className="px-6 py-14">{centre}</div>
        <div className="grid grid-cols-2 gap-3 px-4 pb-16">
          {tiles.map((tile, i) => (
            <div
              key={i}
              style={{
                backgroundColor: tile.tint,
                backgroundImage: tile.image ? `url(${tile.image})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              className="aspect-4/3 w-full"
            />
          ))}
        </div>
      </div>
    </PopupShell>
  );
}
