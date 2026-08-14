"use client";

import Link from "next/link";
import Nav from "@/components/Nav";
import ExhibitionScrollCollage from "@/components/ExhibitionScrollCollage";
import ExhibitionWatermark from "@/components/ExhibitionWatermark";
import type { ExhibitionTile } from "@/lib/teaching";

/** SFK exhibition — wordmark + scroll collage + centre CTA. Tiles from Sanity. */
export default function ExhibitionPageView({
  tiles,
}: {
  tiles: ExhibitionTile[];
}) {
  return (
    <>
      <Nav dark />
      <div className="relative min-h-dvh">
        <ExhibitionWatermark />
        <main className="relative z-10 bg-page/80">
          <ExhibitionScrollCollage tiles={tiles} />

          <div className="px-4 py-16 lg:hidden">
            {tiles.length ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {tiles.map((tile, i) =>
                  tile.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={tile.image}
                      alt={tile.label ?? ""}
                      className="aspect-4/3 w-full object-cover"
                    />
                  ) : (
                    <div
                      key={i}
                      style={{ backgroundColor: tile.tint }}
                      className="aspect-4/3 w-full"
                    />
                  ),
                )}
              </div>
            ) : null}
          </div>

          <div className="pointer-events-none fixed inset-x-0 top-[82px] z-20 flex h-[calc(100dvh-82px)] items-center justify-center">
            <Link
              href="/teaching?view=img&all=1"
              data-cursor="hover"
              className="pointer-events-auto border border-black bg-white px-8 py-3 font-grotesk text-[13px] font-medium uppercase tracking-[0.14em] text-black transition-colors hover:bg-black hover:text-white"
            >
              View student works
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}
