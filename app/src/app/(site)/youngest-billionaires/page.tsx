import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { StoryTemplate } from "@/components/Story";
import {
  YoungestBillionairesArticle,
  youngestBillionairesContents,
} from "@/components/YoungestBillionairesArticle";
import { youngestBillionairesArticle as article } from "@/lib/youngest-billionaires-article";
import { isLeadersReview } from "@/lib/leaders-review";
import { publicationAuthor } from "@/lib/authors";
import type { Story } from "@/lib/domain";
import "@/styles/youngest-billionaires.css";

// Draft article: rendered from repo data only, never from the CMS, and only in
// local demo mode or the isolated Preview. Production returns 404.
export const dynamic = "force-dynamic";
export function generateMetadata(): Metadata {
  if (!isLeadersReview()) return { robots: { index: false, follow: false } };
  return {
    title: { absolute: article.seoTitle },
    description: article.description,
    alternates: { canonical: "https://visionarytalks.com" + article.path },
    robots: { index: false, follow: false },
  };
}
const story: Story = {
  id: "youngest-billionaires-draft",
  path: article.path,
  title: article.title,
  dek: article.dek,
  kind: "article",
  category: "Money",
  author: publicationAuthor,
  sections: [],
  sources: article.sources,
  noindex: true,
};
export default function Page() {
  if (!isLeadersReview()) notFound();
  return (
    <StoryTemplate story={story} contents={youngestBillionairesContents}>
      <YoungestBillionairesArticle />
    </StoryTemplate>
  );
}
