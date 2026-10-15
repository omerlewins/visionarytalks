import "server-only";
import { cache } from "react";
import { canExposeWatchlist } from "./ai-watchlist";
import { publishedResearchStories } from "./published-research-content";
import { previewWatchlist } from "./watchlist-preview";
export const loadWatchlist = cache(async () => {
  if (canExposeWatchlist(process.env))
    return {
      article: previewWatchlist(),
      publishedAt: undefined as string | undefined,
    };
  const record = (await publishedResearchStories()).find(
    (s) => s.research.type === "watchlist" && s.path === "/ai-people-to-watch/",
  );
  return record?.research.type === "watchlist"
    ? { article: record.research.content, publishedAt: record.publishedAt }
    : undefined;
});
