import "server-only";
import { leaderProfiles, type LeaderProfile } from "./leaders";
import { cms, isDemo } from "./content";
import { isLeadersReview } from "./leaders-review";
export async function loadLeaderProfile(
  slug: string,
): Promise<LeaderProfile | undefined> {
  if (!isLeadersReview()) return undefined;
  const base = leaderProfiles.find((p) => p.slug === slug);
  if (!base || isDemo()) return base;
  const payload = await cms();
  const records = await payload.find({
    collection: "claim-evidence",
    overrideAccess: true,
    where: { key: { equals: "content-sync:" + base.path } },
    limit: 1,
    depth: 0,
  });
  const data = records.docs[0]?.data as { profile?: LeaderProfile } | undefined;
  return data?.profile
    ? {
        ...base,
        ...data.profile,
        quickFacts: data.profile.quickFacts ?? base.quickFacts,
        faq: data.profile.faq ?? base.faq,
      }
    : base;
}
