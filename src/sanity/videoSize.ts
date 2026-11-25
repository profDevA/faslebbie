import "server-only";

import { get } from "node:https";

import type { VideoSize, VideoSizes } from "./types";

/**
 * Width × height of the case-study videos, read on the server from the start
 * of each file (WebM / MP4 headers), so the page reserves every video's box
 * before the browser loads it — QA X1, Nov 25: motion bands grew while the
 * visitor scrolled (Coral KPE 877 → 1760) because `CsOverviewVideo` loads
 * nothing until it is in view (`preload="none"`) and an empty <video> is
 * 150 px tall. Sanity keeps no dimensions for file assets, so the file's own
 * metadata is the source; swapping a video in Studio needs nothing else.
 *
 * Sanity file URLs carry the file's sha1, so a URL never changes: a size is
 * cached in memory for the life of the server. A probe that fails or is slow
 * leaves that video unreserved (the old behaviour) until a later visit.
 */

const SANITY_VIDEO_URL =
  /^https:\/\/cdn\.sanity\.io\/files\/[^?#]+\.(?:webm|mp4|m4v|mov)(?:\?.*)?$/i;
/** WebM keeps its Tracks in the first few KB, a "fast start" MP4 its moov
 *  (all 97 case-study videos on Nov 25 were read from their first 8 KB). */
const HEAD_BYTES = 16 * 1024;
/** Generous: a probe runs on after the page is sent, so a slow one costs nothing. */
const PROBE_TIMEOUT_MS = 15000;
/** The page waits at most this long; slower probes finish for the next visit. */
const PAGE_BUDGET_MS = 1500;

const sizes = new Map<string, Promise<VideoSize | null>>();

/** Every Sanity video URL in `value` (a study's sections) → its size. */
export async function getVideoSizes(value: unknown): Promise<VideoSizes> {
  const urls = new Set<string>();
  collectVideoUrls(value, urls);
  if (!urls.size) return {};
  const out: VideoSizes = {};
  const jobs = [...urls].map((url) =>
    probe(url).then((size) => {
      if (size) out[url] = size;
    }),
  );
  let timer: ReturnType<typeof setTimeout> | undefined;
  await Promise.race([
    Promise.all(jobs),
    new Promise((resolve) => {
      timer = setTimeout(resolve, PAGE_BUDGET_MS);
    }),
  ]);
  clearTimeout(timer);
  return { ...out };
}

function collectVideoUrls(value: unknown, urls: Set<string>) {
  if (typeof value === "string") {
    if (SANITY_VIDEO_URL.test(value)) urls.add(value);
  } else if (Array.isArray(value)) {
    for (const v of value) collectVideoUrls(v, urls);
  } else if (value && typeof value === "object") {
    for (const v of Object.values(value)) collectVideoUrls(v, urls);
  }
}

function probe(url: string): Promise<VideoSize | null> {
  let job = sizes.get(url);
  if (!job) {
    job = readSize(url).catch(() => {
      sizes.delete(url); // network trouble: try again on a later visit
      return null;
    });
    sizes.set(url, job);
  }
  return job;
}

async function readSize(url: string): Promise<VideoSize | null> {
  const b = await readHead(url);
  const size =
    b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3
      ? webmSize(b)
      : mp4Size(b);
  return size && size[0] > 0 && size[1] > 0 ? size : null;
}

/** The file's first HEAD_BYTES. Plain `node:https`, not Next's `fetch`: through
 *  `fetch`, a probe still running when the page had rendered never reached the
 *  cache (Galderma's two KPE files stayed unsized on every visit in dev, Nov 25),
 *  and Next doesn't keep 206 responses in its fetch cache anyway. */
function readHead(url: string): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let n = 0;
    const done = () =>
      resolve(new Uint8Array(Buffer.concat(chunks)).subarray(0, HEAD_BYTES));
    const req = get(
      url,
      { headers: { Range: `bytes=0-${HEAD_BYTES - 1}` }, timeout: PROBE_TIMEOUT_MS },
      (res) => {
        if (res.statusCode !== 200 && res.statusCode !== 206) {
          res.resume();
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        res.on("data", (chunk: Buffer) => {
          chunks.push(chunk);
          n += chunk.length;
          // A server that ignores Range sends the whole file: stop at the head.
          if (n >= HEAD_BYTES) {
            done();
            req.destroy();
          }
        });
        res.on("end", done);
        res.on("error", reject);
      },
    );
    req.on("timeout", () => req.destroy(new Error("timeout")));
    req.on("error", reject);
  });
}

// ── WebM / Matroska (EBML) ───────────────────────────────────────────────────

/** EBML variable-length integer at `i`. IDs keep their length marker. */
function readVint(b: Uint8Array, i: number, keepMarker: boolean) {
  const first = b[i];
  if (first === undefined || first === 0) return null;
  let len = 1;
  while (len <= 8 && !(first & (0x80 >> (len - 1)))) len++;
  if (len > 8 || i + len > b.length) return null;
  let value = keepMarker ? first : first & (0xff >> len);
  let allOnes = value === 0xff >> len;
  for (let k = 1; k < len; k++) {
    value = value * 256 + b[i + k];
    if (b[i + k] !== 0xff) allOnes = false;
  }
  return { value, len, unknownSize: !keepMarker && allOnes };
}

function readUint(b: Uint8Array, i: number, n: number) {
  let v = 0;
  for (let k = 0; k < n && i + k < b.length; k++) v = v * 256 + b[i + k];
  return v;
}

const EBML_SEGMENT = 0x18538067;
const EBML_TRACKS = 0x1654ae6b;
const EBML_TRACK_ENTRY = 0xae;
const EBML_VIDEO = 0xe0;
const EBML_CLUSTER = 0x1f43b675;
const EBML_PIXEL_W = 0xb0;
const EBML_PIXEL_H = 0xba;
const EBML_DISPLAY_W = 0x54b0;
const EBML_DISPLAY_H = 0x54ba;
const EBML_DESCEND = new Set([EBML_SEGMENT, EBML_TRACKS, EBML_TRACK_ENTRY, EBML_VIDEO]);

function webmSize(b: Uint8Array): VideoSize | null {
  const px = { w: 0, h: 0, dw: 0, dh: 0 };
  const walk = (start: number, end: number): boolean => {
    let i = start;
    while (i < end && i < b.length) {
      const id = readVint(b, i, true);
      const size = id && readVint(b, i + id.len, false);
      if (!id || !size) return false;
      const body = i + id.len + size.len;
      // Clusters (the frames) come after Tracks: nothing more to find.
      if (id.value === EBML_CLUSTER) return false;
      if (EBML_DESCEND.has(id.value)) {
        const bodyEnd = size.unknownSize ? end : Math.min(end, body + size.value);
        if (walk(body, bodyEnd)) return true;
      } else if (id.value === EBML_PIXEL_W) px.w = readUint(b, body, size.value);
      else if (id.value === EBML_PIXEL_H) px.h = readUint(b, body, size.value);
      else if (id.value === EBML_DISPLAY_W) px.dw = readUint(b, body, size.value);
      else if (id.value === EBML_DISPLAY_H) px.dh = readUint(b, body, size.value);
      if (id.value === EBML_VIDEO && px.w && px.h) return true;
      if (size.unknownSize) return false;
      i = body + size.value;
    }
    return false;
  };
  walk(0, b.length);
  // The browser draws the display size when the file sets one.
  if (px.dw && px.dh) return [px.dw, px.dh];
  return px.w && px.h ? [px.w, px.h] : null;
}

// ── MP4 / QuickTime ──────────────────────────────────────────────────────────

/** First track header (`moov` → `trak` → `tkhd`) with a picture size. */
function mp4Size(b: Uint8Array): VideoSize | null {
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  let found: VideoSize | null = null;
  const walk = (start: number, end: number) => {
    let i = start;
    while (!found && i + 8 <= end) {
      let size = dv.getUint32(i);
      const type = String.fromCharCode(b[i + 4], b[i + 5], b[i + 6], b[i + 7]);
      let header = 8;
      if (size === 1) {
        if (i + 16 > end) return;
        size = dv.getUint32(i + 8) * 2 ** 32 + dv.getUint32(i + 12);
        header = 16;
      } else if (size === 0) size = end - i;
      if (size < header) return;
      if (type === "moov" || type === "trak") {
        walk(i + header, Math.min(end, i + size));
      } else if (type === "tkhd") {
        // version + flags 4, times + track id (v0 20 / v1 32), reserved 8,
        // layer / group / volume / reserved 8, matrix 36, width + height (16.16).
        const v = b[i + header];
        const matrix = i + header + 4 + (v === 1 ? 32 : 20) + 16;
        const wh = matrix + 36;
        if (wh + 8 <= b.length) {
          const w = Math.round(dv.getUint32(wh) / 65536);
          const h = Math.round(dv.getUint32(wh + 4) / 65536);
          // A 90° / 270° rotation matrix (a = 0) swaps the drawn sides.
          const rotated = dv.getInt32(matrix) === 0 && dv.getInt32(matrix + 4) !== 0;
          if (w > 0 && h > 0) found = rotated ? [h, w] : [w, h];
        }
      } else if (type === "mdat") {
        return; // "moov at the end" file: its header isn't in the first bytes
      }
      i += size;
    }
  };
  walk(0, b.length);
  return found;
}
