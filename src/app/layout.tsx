import type { Metadata } from "next";
import localFont from "next/font/local";
import { Poppins } from "next/font/google";
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
      className={`${reckless.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <DotCursor />
        {children}
      </body>
    </html>
  );
}
