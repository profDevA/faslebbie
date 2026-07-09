import type { Metadata, Viewport } from "next";

import { Studio } from "./Studio";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Studio — Fas Lebbie",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function StudioPage() {
  return <Studio />;
}
