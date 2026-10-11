// Run with the local Next.js preview server to retain its image optimization behavior.
import { writeFileSync } from "node:fs";
import { articleAuthor } from "../src/lib/authors";
const origin = process.env.AUTHOR_PREVIEW_ORIGIN ?? "http://127.0.0.1:3107";
const response = await fetch(
  origin + "/what-apple-earns-after-the-hardware-sale/",
  { signal: AbortSignal.timeout(25000) },
);
if (!response.ok)
  throw new Error("Article preview returned " + response.status);
let html = await response.text();
if (
  !html.includes("Daniel Mercer") ||
  !/href="\/about\/?#about-me"/.test(html) ||
  !html.includes("https://www.linkedin.com/company/visionary-talks1/") ||
  !html.includes("author-avatar")
)
  throw new Error("Author presentation missing");
if (
  articleAuthor({ name: "Guest Reporter", path: "/authors/guest/" }).name !==
  "Guest Reporter"
)
  throw new Error("Guest credit lost");
html = html
  .replaceAll('"/_next/', '"' + origin + "/_next/")
  .replaceAll(", /_next/", ", " + origin + "/_next/");
writeFileSync("../growth/authors/article-byline-preview.html", html);
console.log(
  "Running article: byline, author graphic, About link, LinkedIn and guest-credit checks passed.",
);
