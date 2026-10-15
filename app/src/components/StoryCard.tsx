import Link from "next/link";
import type { Story } from "@/lib/domain";
import {
  editorialText,
  storyUpdated,
  watchlistPath,
  watchlistDek,
} from "@/lib/home-editorial";
import { UpdatedStamp } from "./UpdatedStamp";

// Keep this server-only presentation separate from article charts, maps and
// rich-text renderers so listing pages do not load their client bundles.
export function StoryCard({ story }: { story: Story }) {
  return (
    <article className="story latest-story">
      <span className="category">
        {story.category} / {story.kind}
      </span>
      <h3>
        <Link href={story.path}>{editorialText(story.title)}</Link>
      </h3>
      {story.dek !== story.title && (
        <p>
          {story.path === watchlistPath
            ? watchlistDek
            : editorialText(story.dek)}
        </p>
      )}
      <UpdatedStamp date={storyUpdated(story)} />
      <Link className="latest-action" href={story.path}>
        Take a closer look ↗
      </Link>
    </article>
  );
}
