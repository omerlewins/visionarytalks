import Link from "next/link";
import policies from "@/data/publication-policies.json";
export type PolicyName = keyof typeof policies;
export function PublicationPolicy({ name }: { name: PolicyName }) {
  const policy = policies[name];
  const emailText = (text: string) =>
    text
      .split(
        /(daniel@visionarytalks.com|https:\/\/policies.google.com\/technologies\/partner-sites)/,
      )
      .map((part, i) =>
        part === "daniel@visionarytalks.com" ? (
          <a href={"mailto:" + part} key={i}>
            {part}
          </a>
        ) : part ===
          "https://policies.google.com/technologies/partner-sites" ? (
          <a href={part} key={i}>
            Google’s explanation of partner-site data
          </a>
        ) : (
          part
        ),
      );
  return (
    <article className="publication-policy">
      <span className="eyebrow">
        THE PUBLICATION · UPDATED OCTOBER {name === "privacy" ? "13" : "12"},
        2026
      </span>
      <h1>{policy.title}</h1>
      <p className="policy-intro">{emailText(policy.intro)}</p>
      {policy.sections.map((section) => (
        <section key={section.heading}>
          <h2>{section.heading}</h2>
          {section.paragraphs.map((p, i) => (
            <p key={i}>{emailText(p)}</p>
          ))}
        </section>
      ))}
      <nav aria-label="Publication information">
        <Link href="/about/">About Daniel Mercer</Link>
        {" · "}
        <Link href="/ai-disclosure/">AI disclosure</Link>
        {" · "}
        <Link href="/newsletter-privacy/">Newsletter privacy</Link>
        {" · "}
        <Link href="/corrections/">Report a correction</Link>
      </nav>
    </article>
  );
}
