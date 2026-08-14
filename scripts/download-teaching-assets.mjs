/**
 * Download Teaching student-work + exhibition images from faslebbie.com.
 * Run from frontend/: node scripts/download-teaching-assets.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..", "public", "teaching");

const BASE = "https://faslebbie.com";

/** @type {Record<string, { cover: string; slides: string[] }>} */
const STUDENTS = {
  "new-transport": {
    cover: `${BASE}/wp-content/uploads/2025/03/Frame-1.jpg`,
    slides: [
      `${BASE}/wp-content/uploads/2025/03/new_transport_slide_1.jpg`,
      `${BASE}/wp-content/uploads/2025/03/new_transport_slide_2.jpg`,
    ],
  },
  ephemeral: {
    cover: `${BASE}/wp-content/uploads/2025/03/Frame-3.jpg`,
    slides: [
      `${BASE}/wp-content/uploads/2025/03/ephemeral_slide_1.jpg`,
      `${BASE}/wp-content/uploads/2025/03/ephemeral_slide_2.jpg`,
    ],
  },
  "trash-to-treasure": {
    cover: `${BASE}/wp-content/uploads/2025/03/treasure_slide_1.jpg`,
    slides: [
      `${BASE}/wp-content/uploads/2025/03/treasure_slide_1.jpg`,
      `${BASE}/wp-content/uploads/2025/03/treasure_slide_2.jpg`,
    ],
  },
  "honey-honey": {
    cover: `${BASE}/wp-content/uploads/2025/03/Frame-35.jpg`,
    slides: [`${BASE}/wp-content/uploads/2025/03/honey_slide_1.jpg`],
  },
  "the-little-home": {
    cover: `${BASE}/wp-content/uploads/2025/03/Frame-32.jpg`,
    slides: [
      `${BASE}/wp-content/uploads/2025/03/littlehome_slide_1.jpg`,
      `${BASE}/wp-content/uploads/2025/03/littlehome_slide_2.jpg`,
    ],
  },
  "welcome-to-walkatopia": {
    cover: `${BASE}/wp-content/uploads/2025/03/Frame-11.jpg`,
    slides: [
      `${BASE}/wp-content/uploads/2025/03/1_r8ZqzMr05m2srkw-OgNyJg.jpg`,
      `${BASE}/wp-content/uploads/2025/03/1_zqum3XnYZhtuE_61MKzB-A.jpg`,
    ],
  },
  "compare-n-go": {
    cover: `${BASE}/wp-content/uploads/2025/03/Frame-2.jpg`,
    slides: [
      `${BASE}/wp-content/uploads/2025/03/compare_slide_1.jpg`,
      `${BASE}/wp-content/uploads/2025/03/compare_slide_2.jpg`,
    ],
  },
  "pads-tampons-cups": {
    cover: `${BASE}/wp-content/uploads/2025/03/Frame-9.jpg`,
    slides: [
      `${BASE}/wp-content/uploads/2025/03/pads_slide_1-1.jpg`,
      `${BASE}/wp-content/uploads/2025/03/pads_slide_2-1.jpg`,
    ],
  },
  uum: {
    cover: `${BASE}/wp-content/uploads/2025/03/Frame-13.jpg`,
    slides: [
      `${BASE}/wp-content/uploads/2025/03/uum_slide_1.jpg`,
      `${BASE}/wp-content/uploads/2025/03/uum_slide_2.jpg`,
    ],
  },
  "spinning-out": {
    cover: `${BASE}/wp-content/uploads/2025/03/spinning_slide_1.jpg`,
    slides: [
      `${BASE}/wp-content/uploads/2025/03/spinning_slide_1.jpg`,
      `${BASE}/wp-content/uploads/2025/03/spinning_slide_2.jpg`,
    ],
  },
  origin: {
    cover: `${BASE}/wp-content/uploads/2025/03/Origin.jpg`,
    slides: [
      `${BASE}/wp-content/uploads/2025/03/origin_slide_1.jpg`,
      `${BASE}/wp-content/uploads/2025/03/origin_slide_2.jpg`,
      `${BASE}/wp-content/uploads/2025/03/origin_slide_3.jpg`,
      `${BASE}/wp-content/uploads/2025/03/origin_slide_4.jpg`,
      `${BASE}/wp-content/uploads/2025/03/origin_slide_5.jpg`,
      `${BASE}/wp-content/uploads/2025/03/origin_slide_6.jpg`,
      `${BASE}/wp-content/uploads/2025/03/origin_slide_7.jpg`,
      `${BASE}/wp-content/uploads/2025/03/origin_slide_8.jpg`,
      `${BASE}/wp-content/uploads/2025/03/origin_slide_9.jpg`,
    ],
  },
  ecolivery: {
    cover: `${BASE}/wp-content/uploads/2024/11/eco1-1.jpg`,
    slides: [
      `${BASE}/wp-content/uploads/2024/11/eco1-1.jpg`,
      `${BASE}/wp-content/uploads/2024/11/eco2.jpg`,
    ],
  },
  phoneless: {
    cover: `${BASE}/wp-content/uploads/2024/11/22.jpg`,
    slides: [`${BASE}/wp-content/uploads/2024/11/22.jpg`],
  },
  nudge: {
    cover: `${BASE}/wp-content/uploads/2024/11/z.jpg`,
    slides: [
      `${BASE}/wp-content/uploads/2024/11/z.jpg`,
      `${BASE}/wp-content/uploads/2024/11/x.jpg`,
      `${BASE}/wp-content/uploads/2024/11/c.jpg`,
      `${BASE}/wp-content/uploads/2024/11/v.jpg`,
      `${BASE}/wp-content/uploads/2024/11/b.jpg`,
      `${BASE}/wp-content/uploads/2024/11/n.jpg`,
    ],
  },
};

const EXHIBITION = Array.from({ length: 12 }, (_, i) => {
  const n = i + 1;
  const name = n === 11 ? "exhibition-11.jpg" : n === 12 ? "exhibition-12.jpg" : `exhibition-${n}.jpg`;
  return `${BASE}/wp-content/themes/twentynineteen/img/exhibition/${name}`;
});

async function download(url, dest) {
  await fs.mkdir(path.dirname(dest), { recursive: true });
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status} ${url}`);
      const buf = Buffer.from(await res.arrayBuffer());
      await fs.writeFile(dest, buf);
      console.log(`  ✓ ${path.relative(ROOT, dest)}`);
      return;
    } catch (err) {
      if (attempt === 3) throw err;
      console.log(`  retry ${attempt} ${path.basename(dest)}`);
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
}

function extFromUrl(url) {
  const clean = url.split("?")[0];
  const ext = path.extname(clean);
  return ext || ".jpg";
}

async function main() {
  console.log("Downloading student work assets…");
  for (const [id, { cover, slides }] of Object.entries(STUDENTS)) {
    const dir = path.join(ROOT, "students", id);
    await download(cover, path.join(dir, `cover${extFromUrl(cover)}`));
    let i = 0;
    for (const url of slides) {
      i += 1;
      await download(url, path.join(dir, `slide-${i}${extFromUrl(url)}`));
    }
  }

  console.log("Downloading exhibition assets…");
  const exDir = path.join(ROOT, "exhibition");
  for (let i = 0; i < EXHIBITION.length; i++) {
    const url = EXHIBITION[i];
    await download(url, path.join(exDir, `exhibition-${i + 1}.jpg`));
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
