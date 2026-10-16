import Link from "next/link";
import type { ReactNode } from "react";
import {
  youngestBillionairesArticle as article,
  type ArticleBlock,
} from "@/lib/youngest-billionaires-article";
import { WorldBillionaireMap } from "./WorldBillionaireMap";
import { YoungestBillionairesRanking } from "./YoungestBillionairesRanking";

// Renders the small inline subset used by the draft copy: [text](url) and **bold**.
export function inline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const pattern = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  for (const m of text.matchAll(pattern)) {
    if (m.index! > last) parts.push(text.slice(last, m.index));
    if (m[3]) parts.push(<strong key={m.index}>{m[3]}</strong>);
    else if (m[2].startsWith("/"))
      parts.push(
        <Link key={m.index} href={m[2]}>
          {m[1]}
        </Link>,
      );
    else
      parts.push(
        <a key={m.index} href={m[2]} target="_blank" rel="noreferrer">
          {m[1]}
        </a>,
      );
    last = m.index! + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

const block = (b: ArticleBlock, i: number) => {
  switch (b.type) {
    case "p":
      return <p key={i}>{inline(b.text)}</p>;
    case "h2":
      return (
        <h2 key={i} id={b.id}>
          {b.text}
        </h2>
      );
    case "ol":
    case "ul": {
      const List = b.type;
      return (
        <List key={i} className="yb-list">
          {b.items.map((item) => (
            <li key={item}>{inline(item)}</li>
          ))}
        </List>
      );
    }
    case "map":
      return <WorldBillionaireMap key={i} />;
    case "ranking":
      return <YoungestBillionairesRanking key={i} />;
  }
};

export const youngestBillionairesContents = (
  article.blocks as ArticleBlock[]
).flatMap((b) => (b.type === "h2" ? [{ id: b.id, heading: b.text }] : []));

export function YoungestBillionairesArticle() {
  return (
    <div className="yb-article">
      <p className="notice">
        DRAFT · Preview only. Not published. Forbes data as of 1 March 2026.
      </p>
      {(article.blocks as ArticleBlock[]).map(block)}
    </div>
  );
}
