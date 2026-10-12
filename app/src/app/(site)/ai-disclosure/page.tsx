import Link from "next/link";
export const metadata = {
  title: "AI disclosure",
  description:
    "How Visionary Talks uses AI for research, writing, illustrations and data presentation, and how readers can raise corrections or rights concerns.",
  alternates: { canonical: "/ai-disclosure/" },
};
export default function Page() {
  return (
    <article className="publication-policy">
      <span className="eyebrow">TRANSPARENCY / UPDATED OCTOBER 12, 2026</span>
      <h1>How we use AI.</h1>
      <p className="policy-intro">
        Visionary Talks uses AI tools in parts of its research, writing,
        editing, analysis and visual production. We disclose that use so you can
        understand how this publication is made.
      </p>
      <h2>Research and written content</h2>
      <p>
        AI can help identify sources, organise documents, suggest calculations,
        prepare drafts and edit wording. Articles may contain AI-generated or
        AI-assisted text. An AI output is not a source of evidence by itself:
        financial claims should be assessed against the linked documents, dates,
        definitions and assumptions. AI can make errors, omit context or
        misinterpret a record.
      </p>
      <p>
        Visionary Talks retains editorial responsibility for its publication
        decisions and corrections. This statement describes our use of tools; it
        does not certify that every claim has been independently verified or
        that an AI-assisted article is free of errors.
      </p>
      <h2>Illustrations, portraits and graphics</h2>
      <p>
        Some covers, portraits and conceptual graphics are generated or assisted
        by AI. They are editorial illustrations, not authenticated photographs,
        exact likenesses, depictions of verified events or evidence that a
        person participated in a scene. They should not be interpreted as an
        endorsement by a depicted person or company. AI-generated editorial
        illustrations are identified through captions or accompanying notices.
      </p>
      <p>
        Daniel Mercer is the author’s pen name. The author illustration is a
        symbolic representation, not a photograph or an authenticated likeness.
        You can read the{" "}
        <Link href="/about/">
          author’s background and reasons for using a pen name
        </Link>
        .
      </p>
      <h2>Charts, maps and financial estimates</h2>
      <p>
        Our data graphics are distinct from conceptual illustrations. Their
        purpose is to present the observations, calculations or estimates
        identified in the accompanying source notes. Check the reporting date,
        units, methodology and whether a value is observed, calculated or
        estimated. A chart is not evidence of a person’s exact wealth, ownership
        stake or a future investment return. Unknown values should not be
        treated as zero or filled in by AI.
      </p>
      <h2>Names, brands and rights</h2>
      <p>
        Company names, trademarks and references to public figures are used to
        identify subjects of reporting. Unless expressly stated, Visionary Talks
        is not affiliated with them and they have not sponsored or endorsed our
        reporting. AI use does not waive anyone’s copyright, privacy, publicity
        or other rights.
      </p>
      <p>
        If you believe an image or article is inaccurate, misleading or
        infringes your rights, email{" "}
        <a href="mailto:daniel@visionarytalks.com">daniel@visionarytalks.com</a>{" "}
        with the page URL, the specific concern and supporting information. We
        will review the request and make an appropriate correction or removal
        where warranted.
      </p>
      <h2>Use the reporting with context</h2>
      <p>
        Our articles provide general information and analysis, not personalised
        financial, investment, legal or career advice. An AI disclosure does not
        eliminate our editorial obligations or guarantee immunity from legal
        claims.
      </p>
      <p>
        <Link href="/editorial-standards/">Editorial standards ↗</Link> ·{" "}
        <Link href="/corrections/">Corrections ↗</Link>
      </p>
    </article>
  );
}
