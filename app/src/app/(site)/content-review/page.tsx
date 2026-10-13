import Link from "next/link";
import { notFound } from "next/navigation";
import { cms, isDemo } from "@/lib/content";
import { leaderProfiles } from "@/lib/leaders";
import { ownershipFiles } from "@/lib/ownership-files";
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
      <h1>Reviewed content, in one place.</h1>
      <p>
        {
          leaderProfiles.filter((p) => p.editorialReview.status === "approved")
            .length
        }{" "}
        leader profiles and{" "}
        {ownershipFiles.filter((p) => p.gaps.length === 0).length} ownership
        investigations have completed editorial review. Wealth estimates retain
        their source dates and unavailable facts remain explicit. These files
        await a deliberate publication release to the live site.
      </p>
      <OwnershipDirectory />
      <aside className="leader-research-strip">
        <b>New flagship feature: 100 AI People to Watch in 2027</b>
        <p>
          A complete watchlist with a searchable directory, 12 expanded entries,
          source-linked capital and operating tables, and observable 2027 tests.
          Final publication approval is pending.
        </p>
        <Link href="/ai-people-to-watch/">Review the full feature ↗</Link>
      </aside>
      <p>
        These ownership investigations are saved as Preview CMS drafts. To edit
        their structured text, tables or chart observations, open the matching{" "}
        <Link href="/admin/collections/claim-evidence">
          Ownership investigation research record
        </Link>{" "}
        and edit <code>data.file</code>. The{" "}
        <Link href="/admin/collections/content-inbox">Content inbox</Link> keeps
        the full research proposal.
      </p>
      <h2>{leaderProfiles.length} leader profiles</h2>
      <p>
        Including Michael Truell’s Cursor investigation, the 20 new profiles and
        Leopold Aschenbrenner’s conversion to the shared Leaders template.
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
              {p.editorialReview.status === "approved"
                ? "Editorial review complete · Awaiting publication"
                : records.some((d) => d.path === p.path)
                  ? "Saved in Preview CMS · Review needed"
                  : "Local research draft"}
            </small>
          </article>
        ))}
      </div>
      <h2>Earlier research proposals</h2>
      <p>
        These separate first-cycle proposals are outside the reviewed 32-article
        launch batch.
      </p>
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
