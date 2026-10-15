import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { cms, toStory } from "@/lib/content";
import { StoryTemplate } from "@/components/Story";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };
export default async function Preview({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const payload = await cms();
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) notFound();
  const { id } = await params;
  const doc = await payload.findByID({
    collection: "stories",
    id,
    draft: true,
    overrideAccess: false,
    user,
    depth: 2,
  });
  return (
    <>
      <p className="notice">AUTHENTICATED DRAFT PREVIEW · Not published</p>
      <StoryTemplate story={toStory(doc)} />
    </>
  );
}
