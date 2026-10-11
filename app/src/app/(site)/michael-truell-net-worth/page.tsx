import { notFound } from "next/navigation";
import { isLeadersReview } from "@/lib/leaders-review";
import { loadLeaderProfile } from "@/lib/leader-content";
import { LeaderProfile } from "@/components/LeaderProfile";
export const dynamic = "force-dynamic";
export const metadata = {
  title: { absolute: "Michael Truell Net Worth: How He Built Cursor" },
  description:
    "Michael Truell’s Cursor story through archival records, financing disclosures and a dated personal wealth estimate.",
  alternates: { canonical: "/michael-truell-net-worth/" },
  robots: { index: false, follow: false },
};
export default async function Page() {
  if (!isLeadersReview()) notFound();
  const p = await loadLeaderProfile("michael-truell");
  if (!p) notFound();
  return <LeaderProfile leader={p} />;
}
