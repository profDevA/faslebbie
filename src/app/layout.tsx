import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import DotCursor from "@/components/DotCursor";

// Reckless Neue (Displaay) — Fas's own licensed webfonts, migrated from
// faslebbie.com. Weights: Regular 400, Medium 500, SemiBold 600, Bold 700.
const reckless = localFont({
  src: [
    { path: "./fonts/RecklessNeue-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/RecklessNeue-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/RecklessNeue-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/RecklessNeue-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-reckless",
  display: "swap",
});

// Poppins 700 (logo) — self-hosted from Google Fonts (latin subset) so the
// build never depends on a network fetch to fonts.googleapis.com.
const poppins = localFont({
  src: [{ path: "./fonts/Poppins-Bold.woff2", weight: "700", style: "normal" }],
  variable: "--font-poppins",
  display: "swap",
});

// Neue Haas Grotesk — used for the big background wordmark in the v2 hero.
// Roman 400 + Medium 500 are Fas's own licensed cuts (migrated from
// faslebbie.com). Display Pro 75 Bold (700) is the heavy cut the aidesign-os
// wordmark uses; added so the wordmark renders true Bold glyphs rather than a
// synthesized faux-bold. (Fas to confirm his Neue Haas licence covers Bold.)
const nhaas = localFont({
  src: [
    { path: "./fonts/NHaasGroteskDSPro-55Rg.woff2", weight: "400", style: "normal" },
    { path: "./fonts/NHaasGroteskTXPro-65Md.woff2", weight: "500", style: "normal" },
    { path: "./fonts/NHaasGroteskDSPro-75Bd.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-nhaas",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fas Lebbie, Ph.D.",
  description:
    "Designer, researcher, educator — using design as a force for systems transition at scale.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${reckless.variable} ${poppins.variable} ${nhaas.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <DotCursor />
        {children}
      </body>
    </html>
  );
}
