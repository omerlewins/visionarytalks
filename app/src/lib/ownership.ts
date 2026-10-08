import { decodeHTML } from "entities";
export function isOwnershipStory(story: { title: string; path: string }) {
  return (
    /\bwho\s+owns\b/i.test(decodeHTML(story.title)) ||
    /^\/who-owns-/.test(story.path)
  );
}
export function ownershipBrand(title: string) {
  const text = decodeHTML(title).replace(/^.*?\bwho\s+owns\s+/i, "");
  return text
    .split(/[?？]/)[0]
    .replace(/\s+in\s+20\d\d\s*$/i, "")
    .trim();
}
