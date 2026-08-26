/**
 * Upload a tiny test PDF and attach it to Coral Health's fullCaseStudyPdf field.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-coral-full-case-study-pdf.ts --with-user-token
 */
import { createWriteStream, mkdirSync } from "node:fs";
import { join } from "node:path";
import { Readable } from "node:stream";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const SLUG = "coral-health";
const LABEL = "Full Case Study";
const INTRO =
  "This case study is intentionally condensed for a quick overview. Explore the complete research, process and outcomes in the";
const OUT = join(process.cwd(), "tmp", "coral-health-full-case-study-test.pdf");

function escapePdfText(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildTestPdf(lines: string[]): Buffer {
  const body = lines
    .map((line, i) => {
      const y = 720 - i * 28;
      return `72 ${y} Td (${escapePdfText(line)}) Tj`;
    })
    .join("\n");
  const stream = `BT\n/F1 16 Tf\n72 720 Td\n${body}\nET`;
  const streamLen = Buffer.byteLength(stream, "utf8");

  const parts = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n",
    `4 0 obj\n<< /Length ${streamLen} >>\nstream\n${stream}\nendstream\nendobj\n`,
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (const part of parts) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += part;
  }

  const xrefPos = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${parts.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i <= parts.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${parts.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;
  return Buffer.from(pdf, "utf8");
}

async function main() {
  mkdirSync(join(process.cwd(), "tmp"), { recursive: true });

  const pdf = buildTestPdf([
    "Coral Health — Full Case Study (TEST PDF)",
    "",
    "Placeholder document for the Read the Full Case Study link.",
    "Replace this upload in Sanity when Fas supplies the real PDF.",
  ]);

  await new Promise<void>((resolve, reject) => {
    const out = createWriteStream(OUT);
    out.on("error", reject);
    out.on("finish", () => resolve());
    out.end(pdf);
  });
  console.log(`wrote ${OUT} (${pdf.length} bytes)`);

  const doc: { _id: string; title?: string; pdfRef?: string } | null =
    await client.fetch(
      `*[_type == "caseStudy" && slug.current == $slug][0]{
        _id,
        title,
        "pdfRef": fullCaseStudyPdf.asset->_id
      }`,
      { slug: SLUG },
    );

  if (!doc?._id) throw new Error(`case study not found: ${SLUG}`);

  console.log(`before: ${doc.title ?? SLUG} pdf=${doc.pdfRef ?? "none"}`);

  const asset = await client.assets.upload(
    "file",
    Readable.from(pdf),
    {
      filename: "coral-health-full-case-study-test.pdf",
      contentType: "application/pdf",
    },
  );
  console.log(`↑ uploaded ${asset._id}`);

  await client
    .patch(doc._id)
    .set({
      fullCaseStudyPdf: {
        _type: "file",
        asset: { _type: "reference", _ref: asset._id },
      },
      fullCaseStudyLabel: LABEL,
      fullCaseStudyIntro: INTRO,
    })
    .commit();

  const after: { pdfUrl?: string; label?: string } = await client.fetch(
    `*[_id == $id][0]{
      "pdfUrl": fullCaseStudyPdf.asset->url,
      fullCaseStudyLabel
    }`,
    { id: doc._id },
  );

  console.log(`after: label="${after.label}" url=${after.pdfUrl}`);
  console.log("✓ Coral Health test PDF attached");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
