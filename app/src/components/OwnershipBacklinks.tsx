import Link from "next/link";
export const ownershipInboundPages = [
  "/who-owns-cursor/",
  "/who-owns-anthropic-claude/",
  "/who-owns-chatgpt-openai/",
];
export function OwnershipBacklinks({ path }: { path: string }) {
  if (!ownershipInboundPages.includes(path)) return null;
  return (
    <section id="private-ai-comparisons">
      <h2>Compare private AI ownership structures</h2>
      <p>
        A company partnership, investor and shareholder are different
        relationships. Our investigations of{" "}
        <Link href="/who-owns-groq/">Groq’s Nvidia agreement</Link>,{" "}
        <Link href="/who-owns-mistral-ai/">
          Mistral AI’s strategic investors
        </Link>{" "}
        and <Link href="/who-owns-cohere/">Cohere’s pending combination</Link>{" "}
        trace those differences through the dated records.
      </p>
      <p>
        Workplace and professional software offer another comparison:{" "}
        <Link href="/who-owns-canva/">Canva’s parent-company exchange</Link>,{" "}
        <Link href="/who-owns-glean/">Glean’s venture shareholders</Link>,{" "}
        <Link href="/who-owns-notion/">Notion’s employee tender</Link> and{" "}
        <Link href="/who-owns-harvey-ai/">Harvey’s legal AI financing</Link>{" "}
        show why private liquidity and new company capital should be reported
        separately.
      </p>
      <p>
        For capital-intensive AI businesses, follow{" "}
        <Link href="/who-owns-anduril/">Anduril’s stock-transfer rules</Link>,{" "}
        <Link href="/who-owns-crusoe/">Crusoe’s infrastructure funding</Link>{" "}
        and{" "}
        <Link href="/who-owns-lambda/">Lambda’s equity and debt history</Link>.
        Their financing records help explain what ownership means before a
        possible public offering.
      </p>
    </section>
  );
}
