import { config } from "dotenv";
import { createClient } from "@sanity/client";

config({ path: ".env.local" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2025-01-01",
  token: process.env.SANITY_API_READ_TOKEN,
  useCdn: false,
});

const HISTORY_TIME = "2026-08-26T07:59:00Z";
const resp = await client.request({
  uri: `/data/history/production/documents/cs-coral-health?time=${encodeURIComponent(HISTORY_TIME)}`,
  withCredentials: true,
});
const sections = resp.documents?.[0]?.sections ?? [];

const pick = (type) => sections.find((s) => s._type === type);
console.log(
  JSON.stringify(
    {
      coreExperience: pick("coreExperience") && {
        sectionTitle: pick("coreExperience").sectionTitle,
        imageRef: pick("coreExperience").image?.asset?._ref,
      },
      accordion: pick("accordionSection") && {
        variant: pick("accordionSection").variant,
        sectionTitle: pick("accordionSection").sectionTitle,
      },
      media: pick("mediaSection") && {
        ctaUrl: pick("mediaSection").ctaUrl,
        ctaLabel: pick("mediaSection").ctaLabel,
      },
      overview: pick("overviewSection") && { ctaUrl: pick("overviewSection").ctaUrl },
    },
    null,
    2,
  ),
);

const pub = await client.fetch(`*[_id=="cs-coral-health"][0]{
  "overviewCta": sections[_type=="overviewSection"][0].ctaUrl,
  "marketing": sections[_type=="desktopMotionShowcase"][0]{ ctaUrl, ctaLabel }
}`);
console.log("published", JSON.stringify(pub, null, 2));
