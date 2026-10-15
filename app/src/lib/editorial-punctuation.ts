// Display text only. Never run this over URLs, source markup or release hashes.
export const publicationText = (text: string) =>
  text
    .replace(/[\u2014]|&mdash;|&#8212;|&#x2014;/gi, ", ")
    .replace(/[\u2013]|&ndash;|&#8211;|&#x2013;/gi, "-");

// Lexical links keep their original URLs; only text nodes are normalized.
export function publicationRichText(value: any): any {
  if (Array.isArray(value)) return value.map(publicationRichText);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      key === "text" && value.type === "text" && typeof item === "string"
        ? publicationText(item)
        : publicationRichText(item),
    ]),
  );
}
