import { leaderMetadata, leaderSchema } from "@/lib/leader-schema";
import { notFound } from "next/navigation";
import { isLeadersReview } from "@/lib/leaders-review";
import { loadLeaderProfile } from "@/lib/leader-content";
import { LeaderProfile } from "@/components/LeaderProfile";
export const dynamic = "force-dynamic";
export async function generateMetadata() {
  const p = await loadLeaderProfile("michael-truell");
  return p ? leaderMetadata(p) : {};
}
export default async function Page() {
  if (!isLeadersReview()) notFound();
  const p = await loadLeaderProfile("michael-truell");
  if (!p) notFound();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(leaderSchema(p)).replace(/</g, "\\u003c"),
        }}
      />
      <LeaderProfile leader={p} />
    </>
  );
}
