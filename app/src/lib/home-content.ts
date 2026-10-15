import "server-only";
import { cache } from "react";
import { cms, isDemo } from "./content";
import { fixtures } from "@/data/fixtures";
import { homepageEdition, storyUpdated } from "./home-editorial";
export const latestEditorialUpdate = cache(async () => {
  if (isDemo()) return homepageEdition(fixtures).updated;
  const payload = await cms();
  const result = await payload.find({
    collection: "stories",
    overrideAccess: false,
    depth: 0,
    limit: 1,
    sort: "-modifiedAt",
    where: {
      and: [
        { _status: { equals: "published" } },
        { kind: { not_equals: "page" } },
        { excludeFromHomepage: { not_equals: true } },
      ],
    },
    select: { modifiedAt: true, publishedAt: true },
  });
  return result.docs[0] && storyUpdated(result.docs[0]);
});
