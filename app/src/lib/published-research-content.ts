import "server-only";
import { cache } from "react";
import { cms, isDemo } from "./content";
import {
  validatePublishedResearch,
  type PublishedResearch,
} from "./published-research";
export const publishedResearchStories = cache(async () => {
  if (isDemo()) return [];
  const result = await (
    await cms()
  ).find({
    collection: "stories",
    overrideAccess: true,
    depth: 0,
    pagination: false,
    select: {
      path: true,
      kind: true,
      publishedAt: true,
      publishedResearch: true,
    },
    where: {
      and: [
        { _status: { equals: "published" } },
        { publishedResearch: { exists: true } },
      ],
    },
  });
  return result.docs.flatMap((doc) => {
    if (!doc.publishedResearch) return [];
    try {
      validatePublishedResearch(doc.publishedResearch, doc.path, doc.kind);
    } catch {
      return [];
    }
    return [
      {
        path: doc.path,
        publishedAt: doc.publishedAt,
        research: doc.publishedResearch as PublishedResearch,
      },
    ];
  });
});
