// Media records require alt text and a credit. When WordPress supplied
// neither, these internal markers fill the fields; publicMediaText keeps them
// (and the older wording they replace) off the page.
export const legacyMediaPlaceholders = {
  alt: "Legacy image: alt text not supplied",
  credit: "Legacy WordPress media: credit not supplied",
};
const placeholderText = new Set([
  ...Object.values(legacyMediaPlaceholders),
  "Legacy image — alt text review required",
  "Imported WordPress media — attribution retained in private source record; review required",
]);
/** Stored alt or credit text fit to show readers; undefined for placeholders. */
export function publicMediaText(value?: string | null) {
  const text = value?.trim();
  return text && !placeholderText.has(text) ? text : undefined;
}
