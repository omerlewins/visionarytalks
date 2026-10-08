import { XMLParser } from "fast-xml-parser";
import { createHash } from "node:crypto";
import sanitize from "sanitize-html";
export const checksum = (s: string) =>
  createHash("sha256").update(s).digest("hex");
const array = <T>(x: T | T[] | undefined): T[] =>
  x == null ? [] : Array.isArray(x) ? x : [x];
const str = (x: any): string =>
  typeof x === "object" ? String(x?.["#text"] ?? "") : String(x ?? "");
export function legacyPath(url: string) {
  const parsed = new URL(url);
  if (!["https:", "http:"].includes(parsed.protocol))
    throw new Error("Unsupported URL");
  return parsed.pathname + parsed.search;
}
export function targetStatus(status: string) {
  return status === "publish" ? "published" : "draft";
}
export function inspectWXR(xml: string) {
  if (/<!DOCTYPE|<!ENTITY/i.test(xml))
    throw new Error("XML entities and DTDs are not allowed");
  const parsed = new XMLParser({
    ignoreAttributes: false,
    parseTagValue: false,
    trimValues: false,
    processEntities: false,
  }).parse(xml);
  const channel = parsed?.rss?.channel;
  if (!channel) throw new Error("Not a WordPress WXR export");
  const site = str(channel["wp:base_site_url"] || channel.link);
  const items = array<any>(channel.item).map((item, index) => {
    const type = str(item["wp:post_type"]),
      status = str(item["wp:status"]),
      id = str(item["wp:post_id"]) || `missing-${index}`;
    const url = str(item.link),
      rawHTML = str(item["content:encoded"]),
      meta = Object.fromEntries(
        array<any>(item["wp:postmeta"]).map((m) => [
          str(m["wp:meta_key"]),
          str(m["wp:meta_value"]),
        ]),
      );
    const issues: string[] = [];
    let path = "";
    try {
      path = legacyPath(url);
      if (path.includes("?"))
        issues.push("Query-based legacy URL requires explicit routing review");
    } catch {
      issues.push("Missing or invalid public URL");
    }
    const blocks = [...rawHTML.matchAll(/<!--\s*wp:([^\s/>]+)/g)].map(
      (m) => m[1],
    );
    const supported = [
      "paragraph",
      "heading",
      "list",
      "list-item",
      "image",
      "quote",
      "table",
      "separator",
      "spacer",
      "html",
      "group",
      "columns",
      "column",
    ];
    for (const block of new Set(blocks))
      if (!supported.includes(block))
        issues.push(`Unsupported block: ${block}`);
    for (const m of rawHTML.matchAll(/\[([a-zA-Z][\w-]*)(?:\s[^\]]*)?\]/g))
      issues.push(`Unresolved shortcode: ${m[1]}`);
    if (!["post", "page", "attachment"].includes(type))
      issues.push(`Custom content type requires mapping: ${type}`);
    if (!id || id.startsWith("missing-"))
      issues.push("Missing stable WordPress ID");
    const assets = [
      ...rawHTML.matchAll(
        /<(?:img|source|video|audio)[^>]+(?:src|srcset)=["']([^"']+)/g,
      ),
    ].map((m) => m[1]);
    const links = [...rawHTML.matchAll(/<a[^>]+href=["']([^"']+)/g)].map(
      (m) => m[1],
    );
    const cleanHTML = sanitize(rawHTML, {
      allowedTags: sanitize.defaults.allowedTags.concat([
        "img",
        "figure",
        "figcaption",
      ]),
      allowedAttributes: {
        ...sanitize.defaults.allowedAttributes,
        "*": ["id"],
        img: ["src", "srcset", "alt", "width", "height", "loading"],
      },
    });
    if (/<(script|iframe|object|form)\b/i.test(rawHTML))
      issues.push(
        "Active/embed content retained in private source archive; manual conversion required",
      );
    const seo = {
      title: meta._yoast_wpseo_title || meta.rank_math_title || "",
      description:
        meta._yoast_wpseo_metadesc || meta.rank_math_description || "",
      canonical:
        meta._yoast_wpseo_canonical || meta.rank_math_canonical_url || "",
      noindex:
        meta._yoast_wpseo_meta_robots_noindex === "1" ||
        (meta.rank_math_robots ?? "").includes("noindex"),
    };
    return {
      key: `${site}#${id}`,
      id,
      type,
      status,
      url,
      path,
      title: str(item.title),
      slug: str(item["wp:post_name"]),
      author: str(item["dc:creator"]),
      publishedAt: str(item["wp:post_date_gmt"]),
      modifiedAt: str(item["wp:post_modified_gmt"]),
      excerpt: str(item["excerpt:encoded"]),
      rawHTML,
      cleanHTML,
      meta,
      seo,
      assets,
      links,
      attachmentURL: str(item["wp:attachment_url"]),
      taxonomy: array<any>(item.category).map((c) => ({
        name: str(c),
        slug: c["@_nicename"],
        kind: c["@_domain"],
      })),
      comments: array(item["wp:comment"]),
      raw: item,
      checksum: checksum(JSON.stringify(item)),
      issues,
    };
  });
  const byPath = new Map<string, string[]>();
  for (const r of items) {
    if (!r.path || r.type === "attachment") continue;
    byPath.set(r.path, [...(byPath.get(r.path) ?? []), r.id]);
  }
  for (const r of items)
    if ((byPath.get(r.path)?.length ?? 0) > 1)
      r.issues.push("Duplicate path in source");
  return {
    site,
    authors: array<any>(channel["wp:author"]),
    categories: array<any>(channel["wp:category"]),
    tags: array<any>(channel["wp:tag"]),
    items,
    counts: items.reduce<Record<string, number>>((acc, r) => {
      const key = `${r.type}:${r.status}`;
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {}),
  };
}
export function reconcileURLs(
  discovered: string[],
  items: ReturnType<typeof inspectWXR>["items"],
) {
  const known = new Map(items.map((i) => [i.url, i]));
  return discovered.map((url) => ({
    url,
    sourceID: known.get(url)?.id ?? null,
    disposition: known.has(url) ? "pending-import" : "unaccounted-public-url",
  }));
}
export function importDecision(
  sourceChecksum: string,
  priorSource: string | undefined,
  currentTarget: string | undefined,
  priorTarget: string | undefined,
) {
  if (currentTarget && priorTarget && currentTarget !== priorTarget)
    return "editorial-conflict";
  if (sourceChecksum === priorSource) return "unchanged";
  return priorSource ? "update" : "create";
}
