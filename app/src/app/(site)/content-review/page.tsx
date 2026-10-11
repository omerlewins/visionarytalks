import Link from "next/link";
import { notFound } from "next/navigation";
import { cms, isDemo } from "@/lib/content";
import { leaderProfiles } from "@/lib/leaders";
import cycle from "@/data/content-review-drafts.json";
import { isLeadersReview } from "@/lib/leaders-review";
import { OwnershipDirectory } from "@/components/OwnershipInvestigation";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "New Content Review",
  robots: { index: false, follow: false },
};
export default async function Page() {
  if (!isLeadersReview()) notFound();
  const records = isDemo()
    ? []
    : (
        await (
          await cms()
        ).find({
          collection: "stories",
          draft: true,
          overrideAccess: true,
          where: {
            path: {
              in: [
                ...leaderProfiles.map((p) => p.path),
                ...cycle.map((p) => p.path),
              ],
            },
          },
          pagination: false,
          depth: 0,
        })
      ).docs;
  return (
    <section className="section">
      <span className="eyebrow">EDITORIAL DESK / PREVIEW</span>
      <h1>New content, in one place.</h1>
      <p>
        Research drafts for review. Wealth estimates keep their source dates.
        These articles are not published to the live site.
      </p>
      <OwnershipDirectory/>
      <p>These ownership investigations are saved as Preview CMS drafts. To edit their structured text, tables or chart observations, open the matching <Link href="/admin/collections/claim-evidence">Ownership investigation research record</Link> and edit <code>data.file</code>. The <Link href="/admin/collections/content-inbox">Content inbox</Link> keeps the full research proposal.</p>
      <h2>21 leader profiles</h2>
      <p>
        Including Michael Truell’s original Cursor investigation and the 20 new
        profiles.
      </p>
      <div className="leader-directory-grid">
        {leaderProfiles.map((p) => (
          <article className="leader-file" key={p.slug}>
            <span className="eyebrow">{p.company}</span>
            <h3>
              <Link href={p.path}>{p.name} ↗</Link>
            </h3>
            <p>{p.dek}</p>
            <small>
              {records.some((d) => d.path === p.path)
                ? "Saved in Preview CMS · Draft"
                : "Local research draft"}
            </small>
          </article>
        ))}
      </div>
      <h2>First-cycle ownership drafts</h2>
      {cycle.map((p) => (
        <article key={p.id}>
          <h3>
            <Link href={"/review-content/" + p.path.split("/")[1] + "/"}>
              {p.title} ↗
            </Link>
          </h3>
          <p>{p.dek}</p>
          <small>Reporting draft · evidence gaps remain</small>
        </article>
      ))}
      <h2>Existing-article revisions</h2>
      <p>
        McDonald’s, Fiji Water and millionaires-by-state proposals are in the
        CMS Content inbox. Original articles remain intact.
      </p>
      <Link href="/admin/collections/content-inbox">
        Review revision proposals in CMS ↗
      </Link>
    </section>
  );
}
