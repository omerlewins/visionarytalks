"""Read the supplied DOCX into an auditable article import, retaining links."""
import hashlib
import html
import json
import re
import sys
from pathlib import Path
from zipfile import ZipFile
import xml.etree.ElementTree as ET

source = Path(sys.argv[1])
ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
      "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships"}
with ZipFile(source) as z:
    rels = {r.attrib["Id"]: r.attrib["Target"] for r in ET.fromstring(z.read("word/_rels/document.xml.rels"))}
    document = ET.fromstring(z.read("word/document.xml"))

def content(node):
    parts = []
    for child in node:
        tag = child.tag.rsplit("}", 1)[-1]
        if tag == "hyperlink":
            url = rels[child.attrib[f'{{{ns["r"]}}}id']]
            if not url.startswith("https://"):
                raise ValueError("Only HTTPS document links are expected")
            label = content(child)
            parts.append(label if not label.strip() else f'<a href="{html.escape(url, quote=True)}">{label}</a>')
        elif tag == "r":
            text = html.escape("".join(t.text or "" for t in child.findall("w:t", ns)))
            if child.find("w:rPr/w:b", ns) is not None:
                text = "<strong>" + text + "</strong>"
            if child.find("w:rPr/w:i", ns) is not None:
                text = "<em>" + text + "</em>"
            parts.append(text)
    return "".join(parts)

blocks, headings, plain = [], [], []
title = None
for p in document.findall("w:body/w:p", ns):
    text = "".join(t.text or "" for t in p.findall(".//w:t", ns)).strip()
    if not text:
        continue
    style_node = p.find("w:pPr/w:pStyle", ns)
    style = style_node.attrib.get(f'{{{ns["w"]}}}val', "") if style_node is not None else ""
    if title is None:
        title = text
        continue
    plain.append(text)
    if style.lower().replace(" ", "") == "heading2":
        anchor = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
        headings.append(text)
        blocks.append(f'<h2 id="{anchor}">{content(p)}</h2>')
    else:
        blocks.append(f"<p>{content(p)}</p>")

article = {
    "title": title,
    "path": "/small-business-marketing-strategies/",
    "kind": "article",
    "category": "Business",
    "dek": "Practical ways to understand your customers, improve your online presence and measure marketing results on a small-business budget.",
    "excludeFromHomepage": True,
    "sourceRecords": [
        {"title": "SEO Starter Guide", "url": "https://developers.google.com/search/docs/fundamentals/seo-starter-guide", "publisher": "Google Search Central", "evidence": "Primary guidance on crawlable pages, useful content, descriptive titles and links. Rankings and results are not guaranteed."},
        {"title": "Ant Display product catalogue", "url": "https://antdisplay.com/", "publisher": "Ant Display", "evidence": "Supplier examples include display cases, shelving, store fixtures and commercial furniture. This catalogue does not establish marketing results or a product endorsement."},
        {"title": "RT Display product catalogue", "url": "https://rtdisplay.com/", "publisher": "RT Display", "evidence": "Supplier examples include retail displays, shop furniture, display racks and shelving. This catalogue does not establish marketing results or a product endorsement."}
    ],
    "legacyHTML": "\n".join(blocks),
    "seo": {
        "title": "Small Business Marketing Strategies | Visionary Talks",
        "description": "A practical guide to small-business marketing: customer research, SEO, useful content, partnerships, reviews and measuring results.",
        "canonical": "https://visionarytalks.com/small-business-marketing-strategies/",
        "noindex": False,
    },
    "sourceDocument": {"filename": source.name, "sha256": hashlib.sha256(source.read_bytes()).hexdigest(), "headings": headings, "paragraphCount": len(blocks), "wordCount": len(" ".join(plain).split())},
}
if re.search(r"[\u2013\u2014]", article["legacyHTML"]):
    raise ValueError("Review long dashes before importing")
Path(__file__).with_name("article.json").write_text(json.dumps(article, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print(json.dumps({"title": title, "sections": len(headings), "blocks": len(blocks), "links": article["legacyHTML"].count("<a ") }))
