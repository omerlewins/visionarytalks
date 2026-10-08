import sanitize from "sanitize-html";
import { decodeHTML } from "entities";

export function legacyHeadings(html: string) {
  const toc: { id: string; heading: string }[] = [];
  const content = html.replace(
    /<h([1-6])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (_match, level, attributes, text) => {
      const existing = attributes.match(/\bid\s*=\s*(["'])(.*?)\1/i)?.[2];
      const id = existing ?? `legacy-heading-${toc.length + 1}`;
      toc.push({
        id,
        heading: decodeHTML(
          sanitize(text, { allowedTags: [], allowedAttributes: {} }),
        ),
      });
      return `<h${level}${attributes}${existing ? "" : ` id="${id}"`}>${text}</h${level}>`;
    },
  );
  return { content, toc };
}

/** Rewrite verified media references without modifying the archived source HTML. */
export function rewriteLegacyHTML(
  html: string,
  site: string,
  media: Map<string, string>,
) {
  const url = (value: string) => new URL(value.replaceAll("&amp;", "&"), site);
  const asset = (value: string) => {
    try {
      return media.get(url(value).href) ?? value;
    } catch {
      return value;
    }
  };
  return sanitize(html, {
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
    transformTags: {
      img: (tagName, attributes) => ({
        tagName,
        attribs: {
          ...attributes,
          ...(attributes.src ? { src: asset(attributes.src) } : {}),
          ...(attributes.srcset
            ? {
                srcset: attributes.srcset
                  .split(",")
                  .map((candidate) => {
                    const [source, ...descriptor] = candidate
                      .trim()
                      .split(/\s+/);
                    return [asset(source), ...descriptor].join(" ");
                  })
                  .join(", "),
              }
            : {}),
        },
      }),
      a: (tagName, attributes) => {
        if (!attributes.href) return { tagName, attribs: attributes };
        try {
          const target = url(attributes.href);
          const href =
            media.get(target.href) ??
            (target.origin === new URL(site).origin
              ? target.pathname + target.search + target.hash
              : attributes.href);
          return { tagName, attribs: { ...attributes, href } };
        } catch {
          return { tagName, attribs: attributes };
        }
      },
    },
  });
}
