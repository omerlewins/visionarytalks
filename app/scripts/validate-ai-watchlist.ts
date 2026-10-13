import { aiWatchlistSchema } from "../src/lib/ai-watchlist";
import { readFileSync } from "node:fs";
const data = JSON.parse(readFileSync("src/data/ai-watchlist.json", "utf8"));
const article = aiWatchlistSchema.parse(data);
if (
  process.argv.includes("--publish") &&
  article.editorialReview.status !== "approved"
)
  throw new Error(
    "Watchlist has not received editorial publication approval. Structural validation does not certify external facts.",
  );
console.log(
  `Watchlist contract valid: ${article.people.length} people, ${article.capitalEvents.length} company events, ${Object.keys(article.sources).length} source records. ${article.editorialReview.status}.`,
);
