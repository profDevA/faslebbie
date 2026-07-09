"use client";

// Client boundary for the embedded Studio. Importing sanity.config (and thus
// Sanity, which does `import useSWR from "swr"`) must happen inside a client
// component — otherwise Turbopack resolves `swr` to its RSC build, which has no
// default export, and the /studio route fails to compile.
import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";

export function Studio() {
  return <NextStudio config={config} />;
}
