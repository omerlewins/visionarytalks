import "server-only";
import { cache } from "react";
import { aiWatchlist, canExposeWatchlist } from "./ai-watchlist";
import { publishedResearchStories } from "./published-research-content";
export const loadWatchlist = cache(async () => {
  if (canExposeWatchlist(process.env))
    return {
      article: aiWatchlist,
      publishedAt: undefined as string | undefined,
    };
  const record = (await publishedResearchStories()).find(
    (s) => s.research.type === "watchlist" && s.path === "/ai-people-to-watch/",
  );
  return record?.research.type === "watchlist"
    ? { article: record.research.content, publishedAt: record.publishedAt }
    : undefined;
});
