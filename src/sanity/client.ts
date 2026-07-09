import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId, readToken } from "./env";

// Public read client. Dataset is private, so published-content reads use the
// server-only token. `useCdn` is disabled when a token is present so we always
// get fresh, authorized responses (the CDN doesn't serve token-auth requests).
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: !readToken,
  token: readToken || undefined,
  perspective: "published",
});
