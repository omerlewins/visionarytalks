import { isLeadersReview } from "@/lib/leaders-review";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { stories } from "@/lib/content";
import {
  featuredLeaders,
  leaderProfiles,
  leaderPortrait,
  leaderSummary,
} from "@/lib/leaders";
import { LeadersDirectory } from "@/components/LeadersDirectory";
export const metadata: Metadata = {
  title: "AI Leaders: People, Ownership & Net Worth",
  description:
    "Investigate the people building AI companies. Dated wealth estimates, company ownership, original records and transparent research methods.",
  alternates: { canonical: "/leaders/" },
  robots: isLeadersReview() ? { index: false, follow: false } : undefined,
};
export default async function LeadersPage() {
  if (!isLeadersReview()) {
    const published = (await stories()).filter((s) => s.kind === "leader");
    return (
      <section className="section">
        <span className="eyebrow">PEOPLE / LEADERS</span>
        <h1>The company builders.</h1>
        <p>The people, ownership and decisions behind the business.</p>
        {published.map((s) => (
          <p key={s.id}>
            <Link href={s.path}>{s.title}</Link>
          </p>
        ))}
        {!published.length && <p>Our first profiles are being researched.</p>}
      </section>
    );
  }
  const lead = featuredLeaders[0];
  return (
    <>
      <header className="leaders-heading">
        <span className="eyebrow">VISIONARY TALKS / THE PEOPLE BEHIND AI</span>
        <div>
          <h1>Leaders.</h1>
          <p>
            The backstory. The ownership.
            <br />
            The money behind the mission.
          </p>
        </div>
      </header>
      <section className="leaders-cover" aria-label="Featured leader">
        <div className="leaders-cover-copy">
          <span className="eyebrow">THE RESEARCH FILE / {lead.company}</span>
          <h2>
            <Link href={lead.path}>
              Who is
              <br />
              <em>{lead.name}?</em>
            </Link>
          </h2>
          <p>{lead.dek}</p>
          <Link className="index-cta" href={lead.path}>
            Open the profile ↗
          </Link>
        </div>
        <Link
          href={lead.path}
          className="leaders-cover-art"
          aria-label={"Read " + lead.name}
        >
          <Image
            src={leaderPortrait(lead)!}
            alt={"AI editorial illustration of " + lead.name}
            width={1024}
            height={1536}
            priority
            sizes="(max-width:700px) 90vw, 45vw"
          />
          <span>AI EDITORIAL ILLUSTRATION</span>
        </Link>
        <div className="leaders-cover-rail">
          <span className="eyebrow">ALSO IN THIS EDITION</span>
          {featuredLeaders.slice(1).map((p) => (
            <article key={p.slug}>
              <span className="eyebrow">{p.company}</span>
              <h3>
                <Link href={p.path}>{p.name} ↗</Link>
              </h3>
              <p>{p.hook}.</p>
            </article>
          ))}
        </div>
      </section>
      <aside className="leader-research-strip">
        <b>Research, with the receipts.</b>
        <p>
          Independent desk research from filings, original papers and company
          records. Personal wealth estimates carry dates. Company valuations
          stay separate.
        </p>
        <div className="leader-research-links">
          <Link href="/about/#research">Our approach ↗</Link>
          <Link href="/content-review/">All new content ↗</Link>
        </div>
      </aside>
      <LeadersDirectory leaders={leaderProfiles.map(leaderSummary)} />
    </>
  );
}
