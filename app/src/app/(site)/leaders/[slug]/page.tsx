import { leaderMetadata, leaderSchema } from "@/lib/leader-schema";
import { loadLeaderProfile } from "@/lib/leader-content";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { isLeadersReview } from "@/lib/leaders-review";
import { LeaderProfile } from "@/components/LeaderProfile";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isLeadersReview()) return { robots: { index: false, follow: false } };
  const { slug } = await params;
  const p = await loadLeaderProfile(slug);
  return p ? leaderMetadata(p) : {};
}
export default async function Page({ params }: Props) {
  if (!isLeadersReview()) notFound();
  const { slug } = await params;
  const p = await loadLeaderProfile(slug);
  if (!p) notFound();
  if (p.path !== "/leaders/" + slug + "/") permanentRedirect(p.path);
  const schema = leaderSchema(p);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      <LeaderProfile leader={p} />
    </>
  );
}
