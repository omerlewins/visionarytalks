import { notFound } from "next/navigation";
import { cms, toStory } from "@/lib/content";
import { isLeadersReview } from "@/lib/leaders-review";
import cycle from "@/data/content-review-drafts.json";
import { StoryTemplate } from "@/components/Story";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Reporting Draft Review",
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!isLeadersReview()) notFound();
  const { slug } = await params;
  const item = cycle.find((p) => p.path === "/" + slug + "/");
  if (!item) notFound();
  const record = (
    await (
      await cms()
    ).find({
      collection: "stories",
      draft: true,
      overrideAccess: true,
      where: { path: { equals: item.path } },
      limit: 1,
      depth: 2,
    })
  ).docs[0];
  if (!record) notFound();
  return (
    <>
      <p className="notice">
        REPORTING DRAFT · Research incomplete · Not published
      </p>
      <StoryTemplate story={toStory(record)} />
    </>
  );
}
