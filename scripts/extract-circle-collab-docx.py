"""
Extract Circle (Mosaic) case-study copy from the collaboration .docx.
Uses table-cell highlight (w:shd fill): green = shippable, red = skip.

  python scripts/extract-circle-collab-docx.py "path/to/doc.docx"
  python scripts/extract-circle-collab-docx.py   # default Downloads path

Writes scripts/data/caseStudyCollabCopy.json (merges circle key only).
"""
from __future__ import annotations

import json
import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}

GREEN = {"C6EFCE", "E2EFDA", "D9EAD3", "92D050", "B6D7A8", "C5E0B4", "D5E8D4"}
RED = {"FFC7CE", "F4CCCC", "EA9999", "FFCCCC", "FCE4D6", "F8CBAD"}

DEFAULT_DOCX = Path.home() / "Downloads" / "faslebbie + Xiang Collaboration SITE FINAL COPY.docx"
OUT = Path(__file__).resolve().parent / "data" / "caseStudyCollabCopy.json"


def classify_fills(fills: set[str]) -> str | None:
    if not fills:
        return None
    for f in fills:
        fu = f.upper()
        if fu in GREEN:
            return "green"
        if fu in RED:
            return "red"
    return "other"


def cell_lines(tc) -> list[tuple[str | None, str]]:
    out: list[tuple[str | None, str]] = []
    for p in tc.findall(".//w:p", NS):
        texts: list[str] = []
        fills: set[str] = set()
        for r in p.findall("w:r", NS):
            t = r.find("w:t", NS)
            if t is not None and t.text:
                texts.append(t.text)
            for shd in r.findall("w:rPr/w:shd", NS):
                f = shd.get(W + "fill")
                if f and f.upper() not in ("AUTO", "FFFFFF", "F5F5F0"):
                    fills.add(f.upper())
        line = "".join(texts).strip()
        if line:
            out.append((classify_fills(fills), line))
    return out


def load_items(docx: Path) -> list[tuple[str | None, str]]:
    with zipfile.ZipFile(docx) as z:
        root = ET.fromstring(z.read("word/document.xml"))
    items: list[tuple[str | None, str]] = []
    for tbl in root.findall(".//w:tbl", NS):
        for tr in tbl.findall("w:tr", NS):
            cells = tr.findall("w:tc", NS)
            for tc in cells:
                for pair in cell_lines(tc):
                    items.append(pair)
    return items


def clean(t: str) -> str:
    return re.sub(r"\s+", " ", t).strip()


def is_tag_line(t: str) -> bool:
    return t.startswith("[SOURCED") or t.startswith("[SPECULATIVE")


def is_structural_label(t: str) -> bool:
    return bool(
        re.match(
            r"^(Accordion|Metric|Group|Experience|Project name|Hero statement|"
            r"Overview paragraph|Research &|Duration|Team|Problem Context|What I Brought|"
            r"My Approach|Description|Reflections|Next Steps|Value:|Framing|Template|"
            r'Section-by-section|"From"|"To")',
            t,
        )
        or re.match(r"^\d{2} —", t)
    )


def extract_after_exact(items: list[tuple[str | None, str]], label: str) -> str | None:
    label_color = next((c for c, t in items if t == label), None)
    if label_color != "green":
        return None
    for i, (c, t) in enumerate(items):
        if t != label:
            continue
        for j in range(i + 1, min(i + 8, len(items))):
            c2, t2 = items[j]
            if is_tag_line(t2):
                continue
            if is_structural_label(t2):
                break
            if c2 == "green" and len(t2) > 1:
                return clean(t2)
    return None


def parse_accordions(items: list[tuple[str | None, str]]) -> list[dict[str, str]]:
    acc: list[dict[str, str]] = []
    for i, (c, t) in enumerate(items):
        m = re.match(r"^Accordion (\d+) — (.+)$", t)
        if not m or c != "green":
            continue
        title = clean(m.group(2))
        body = None
        for j in range(i + 1, i + 6):
            c2, t2 = items[j]
            if is_tag_line(t2):
                continue
            if re.match(r"^Accordion ", t2) or re.match(r"^\d{2} —", t2):
                break
            if len(t2) > 30:
                body = clean(t2)
                break
        if body:
            acc.append({"title": title, "body": body})
    return acc


def parse_metrics(items: list[tuple[str | None, str]]) -> list[dict[str, str]]:
    metrics: list[dict[str, str]] = []
    for c, t in items:
        if c != "green" or not t.startswith("Value:"):
            continue
        m = re.search(
            r"Value:\s*([^·]+?)\s*·\s*Label:\s*([^·]+?)\s*·\s*Description:\s*(.+)",
            t.replace("\u00a0", " "),
        )
        if not m:
            continue
        raw_val = clean(m.group(1))
        label = clean(m.group(2))
        note = clean(m.group(3))
        suffix = ""
        val = raw_val
        if raw_val.startswith(">"):
            num = raw_val.lstrip(">").replace("%", "").strip()
            val = num
            suffix = "%" if "%" in raw_val else ""
            metrics.append(
                {
                    "value": val,
                    "prefix": ">",
                    "suffix": suffix,
                    "label": label,
                    "note": note,
                }
            )
            continue
        elif raw_val.endswith("%"):
            val = raw_val[:-1].strip()
            suffix = "%"
        metrics.append({"value": val, "suffix": suffix, "label": label, "note": note})
    return metrics


def build_circle(items: list[tuple[str | None, str]]) -> dict:
    acc = parse_accordions(items)
    blurb = ""
    if acc:
        first = acc[0]["body"]
        parts = first.split(". ")
        blurb = parts[0] + "." if parts else first[:220]

    next_steps = extract_after_exact(items, "Next Steps paragraph (62 words)")
    return {
        "title": "Circle",
        "hero": {
            "projectName": "Circle",
            "statement": extract_after_exact(items, "Hero statement") or "",
            "from": extract_after_exact(items, '"From" value') or "",
            "to": extract_after_exact(items, '"To" value') or "",
        },
        "overview": {
            "body": extract_after_exact(items, "Overview paragraph (102 words)") or "",
            "disciplines": extract_after_exact(
                items, "Research & Design disciplines (15 words)"
            )
            or "",
            "duration": extract_after_exact(items, "Duration") or "",
            "team": extract_after_exact(items, "Team") or "",
        },
        "approach": {"blurb": blurb, "accordion": acc},
        "artifacts": {
            "intro": extract_after_exact(items, "Description (14 words)") or "",
        },
        "impact": {"metrics": parse_metrics(items)},
        "reflection": {
            "body": extract_after_exact(items, "Reflections paragraph (111 words)") or "",
            "nextSteps": [next_steps] if next_steps else [],
        },
    }


def main() -> None:
    docx = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_DOCX
    if not docx.exists():
        sys.exit(f"Missing docx: {docx}")

    items = load_items(docx)
    circle = build_circle(items)

    if not circle["hero"]["statement"]:
        sys.exit("Could not parse Circle hero — check docx format")

    existing = {}
    if OUT.exists():
        existing = json.loads(OUT.read_text(encoding="utf-8"))
    prev_circle = existing.get("circle") or {}
    # Red-highlight sections (03, 04, 07, 08) stay out of Sanity until collab marks them green.
    if prev_circle.get("problemContext"):
        circle["problemContext"] = prev_circle["problemContext"]
    existing["circle"] = circle
    OUT.write_text(json.dumps(existing, indent=2) + "\n", encoding="utf-8")

    red_sections = [
        t
        for c, t in items
        if c == "red" and re.match(r"^\d{2} —", t)
    ]
    print(f"OK merged circle -> {OUT}")
    print(
        f"  green shipped: 01–02, 05–06, 09–10 "
        f"({len(circle['approach']['accordion'])} accordions, "
        f"{len(circle['impact']['metrics'])} metrics)"
    )
    print(f"  skipped red sections: {', '.join(red_sections) or '(none)'}")


if __name__ == "__main__":
    main()
