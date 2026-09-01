import type { Metadata } from "next";
import localFont from "next/font/local";
import "./fonts/reckless-neue.css";
import "./globals.css";
import DotCursor from "@/components/DotCursor";
import { SiteProvider } from "@/components/SiteProvider";
import { siteFromSanity } from "@/lib/siteFromSanity";
import { siteMetadataFromSanity } from "@/lib/siteMetadata";
import { getSiteSettings } from "@/sanity/fetch";

// Poppins 700 (logo) — self-hosted from Google Fonts (latin subset) so the
// build never depends on a network fetch to fonts.googleapis.com.
const poppins = localFont({
  src: [{ path: "./fonts/Poppins-Bold.woff2", weight: "700", style: "normal" }],
  variable: "--font-poppins",
  display: "swap",
});

// Neue Haas Grotesk — Fas's own licensed cuts, kept only so the Sep 1 one-font
// decision can be reverted by pointing `--font-grotesk` back at `--font-nhaas`
// in globals.css. Nothing references it today, so `preload: false` keeps the
// three files (~88 KB) off every page. Delete this block once the swap sticks.
const nhaas = localFont({
  src: [
    { path: "./fonts/NHaasGroteskDSPro-55Rg.woff2", weight: "400", style: "normal" },
    { path: "./fonts/NHaasGroteskTXPro-65Md.woff2", weight: "500", style: "normal" },
    { path: "./fonts/NHaasGroteskDSPro-75Bd.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-nhaas",
  display: "swap",
  preload: false,
});

// Favicon / title / OG come from Site Settings → SEO / Share (Sanity).
// Local fallbacks live in siteMetadataFromSanity until fields are filled.
export async function generateMetadata(): Promise<Metadata> {
  return siteMetadataFromSanity(await getSiteSettings());
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const site = siteFromSanity(await getSiteSettings());
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${nhaas.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <SiteProvider value={site}>
          <DotCursor />
          {children}
        </SiteProvider>
      </body>
    </html>
  );
}
