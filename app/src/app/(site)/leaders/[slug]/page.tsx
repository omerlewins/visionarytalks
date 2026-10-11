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
  return p
    ? {
        title: { absolute: p.seo.title },
        description: p.seo.description,
        alternates: { canonical: p.path },
        robots: { index: false, follow: false },
      }
    : {};
}
export default async function Page({ params }: Props) {
  if (!isLeadersReview()) notFound();
  const { slug } = await params;
  const p = await loadLeaderProfile(slug);
  if (!p) notFound();
  if (p.path !== "/leaders/" + slug + "/") permanentRedirect(p.path);
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Who is " + p.name + "? " + p.hook + ".",
    description: p.seo.description,
    dateModified: p.checked,
    author: {
      "@type": "Person",
      name: "Daniel Mercer",
      url: "https://visionarytalks.com/about/#about-me",
    },
    publisher: {
      "@type": "Organization",
      name: "Visionary Talks",
      url: "https://visionarytalks.com",
    },
    mainEntityOfPage: "https://visionarytalks.com" + p.path,
    about: { "@type": "Person", name: p.name },
  };
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
