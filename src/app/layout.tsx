import type { Metadata } from "next";
import { Fraunces, Poppins } from "next/font/google";
import "./globals.css";
import DotCursor from "@/components/DotCursor";

// Reckless Neue stand-in until Fas provides licensed webfont files (Displaay).
// To swap: replace with next/font/local pointing at RecklessNeue-*.woff2 and
// keep the same `variable` name — nothing else changes.
const reckless = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-reckless",
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
