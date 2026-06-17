import type { Metadata } from "next";
import localFont from "next/font/local";
import { Poppins, Archivo_Black } from "next/font/google";
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

const poppins = Poppins({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-poppins",
});

// Stand-in for "Druk Text" (commercial — not in repo) on the About heading.
// Archivo Black is the closest free, OFL-licensed match for Druk Text's wide,
// heavy grotesque. The real Druk takes over via the --font-druk stack once a
// licensed woff2 is added. TODO(Israel/Fas): supply licensed Druk Text.
const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-archivo-black",
});

// Neue Haas Grotesk (Fas's licensed files, migrated from faslebbie.com) — used
// for the big background wordmark in the v2 hero. Display Roman + Text Medium
// are the heaviest weights available on his server (no Bold cut).
const nhaas = localFont({
  src: [
    { path: "./fonts/NHaasGroteskDSPro-55Rg.woff2", weight: "400", style: "normal" },
    { path: "./fonts/NHaasGroteskTXPro-65Md.woff2", weight: "500", style: "normal" },
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
      className={`${reckless.variable} ${poppins.variable} ${nhaas.variable} ${archivoBlack.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <DotCursor />
        {children}
      </body>
    </html>
  );
}
