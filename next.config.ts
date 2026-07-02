import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the Turbopack workspace root to this app. The repo has a second
  // lockfile at the monorepo root (for the /scripts extractor tooling), which
  // otherwise makes Next infer the wrong root and mis-resolve modules.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
