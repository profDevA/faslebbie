import re
import zipfile

docx = r"f:\working\Fas\fasportfolio\docs\reference\faslebbie + Xiang Collaboration SITE FINAL COPY.docx"
out = r"f:\working\Fas\fasportfolio\docs\reference\build-popup-copy-extract.txt"

with zipfile.ZipFile(docx) as z:
    xml = z.read("word/document.xml").decode("utf-8")

text = re.sub(r"</w:p>", "\n", xml)
text = re.sub(r"<[^>]+>", "", text)
text = (
    text.replace("&quot;", '"')
    .replace("&amp;", "&")
    .replace("&lt;", "<")
    .replace("&gt;", ">")
)

# Build tab body starts near listing intro; project detail follows.
start = text.find("The Playground is a living archive")
if start < 0:
    start = text.find("Necessity is the mother of innovation")
if start < 0:
    start = text.find("Pebble came from researching")

# End before next major section (Teaching or Case Studies or similar)
end_markers = [
    "Teaching Page",
    "Teaching",
    "Case Studies",
    "Research Page",
    "Testimonials",
]
end = len(text)
for m in end_markers:
    i = text.find(m, start + 100)
    if i >= 0:
        end = min(end, i)

chunk = text[start:end].strip()
with open(out, "w", encoding="utf-8") as f:
    f.write(chunk)

print("start", start, "end", end, "lines", len(chunk.splitlines()))
