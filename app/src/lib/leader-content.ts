import "server-only";
import { validateLeader } from "./leader-validation";
import { leaderSources } from "./leaders";
import { leaderProfiles, type LeaderProfile } from "./leaders";
import { cms, isDemo } from "./content";
import { isLeadersReview } from "./leaders-review";
import { publishedResearchStories } from "./published-research-content";
export async function publicLeaderProfiles() {
  return (await publishedResearchStories()).flatMap((s) =>
    s.research.type === "leader" ? [s.research.content] : [],
  );
}
export async function loadLeaderProfile(
  slug: string,
): Promise<LeaderProfile | undefined> {
  if (!isLeadersReview()) {
    const record = (await publishedResearchStories()).find(
      (s) => s.research.type === "leader" && s.research.content.slug === slug,
    );
    return record?.research.type === "leader"
      ? Object.assign({}, record.research.content, {
          publishedAt: record.publishedAt,
        })
      : undefined;
  }
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
  const stored = data?.profile
    ? {
        ...base,
        ...data.profile,
        quickFacts: data.profile.quickFacts ?? base.quickFacts,
        faq: data.profile.faq ?? base.faq,
      }
    : base;
  return validateLeader(stored, leaderSources).errors.length ? base : stored;
}
