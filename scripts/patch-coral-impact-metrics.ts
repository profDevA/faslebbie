/** Coral §09 Impact — live-site metric order + Funding $4M prefix. */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

const ITEMS = [
  {
    _type: "statItem" as const,
    _key: "23caa62d6a3b",
    value: 75,
    suffix: "%",
    label: "Provider Match Retention",
    note: "Patients found and stayed with their culturally competent providers.",
  },
  {
    _type: "statItem" as const,
    _key: "75cf3b247a86",
    value: 30,
    suffix: "%",
    label: "Screening Follow-Through",
    note: "Increase in users completing recommended screenings",
  },
  {
    _type: "statItem" as const,
    _key: "ace2b8a10cdf",
    value: 4,
    prefix: "$",
    suffix: "M",
    label: "Funding Influenced",
    note: "Experience strategy directly helped this early-stage venture secure funding",
  },
];

async function main() {
  const doc = await client.fetch<{ sections: { _key: string; _type: string }[] }>(
    `*[_id == "cs-coral-health"][0]{ sections[]{ _key, _type } }`,
  );
  const i = doc.sections.findIndex((s) => s._type === "statsSection");
  if (i < 0) throw new Error("no statsSection");

  for (const id of ["cs-coral-health", "drafts.cs-coral-health"]) {
    const exists = await client.getDocument(id);
    if (!exists) continue;
    await client.patch(id).set({ [`sections[${i}].items`]: ITEMS }).commit();
    console.log(`✓ impact metrics on ${id}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
