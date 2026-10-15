import Link from "next/link";
import Image from "next/image";
import type { Story } from "@/lib/domain";
import type { AIWatchlist } from "@/lib/ai-watchlist";
import {
  editorialText,
  storyUpdated,
  watchlistPath,
} from "@/lib/home-editorial";
import { storyFeaturedImage } from "@/lib/story-image";
import { UpdatedStamp } from "./UpdatedStamp";
import { WatchlistHomeFeature } from "./WatchlistHomeFeature";

export function HomeHero({
  story,
  watchlist,
}: {
  story?: Story;
  watchlist?: AIWatchlist;
}) {
  if (story?.path === watchlistPath && watchlist)
    return <WatchlistHomeFeature article={watchlist} />;
  if (!story) return null;
  const image = storyFeaturedImage(story);
  return (
    <section className="home-article-hero">
      <div>
        <span className="eyebrow">
          {editorialText(story.category)} / FEATURED
        </span>
        <h1>
          <Link prefetch={false} href={story.path}>
            {editorialText(story.homepageHeadline || story.title)}
          </Link>
        </h1>
        <p>{editorialText(story.dek)}</p>
        <UpdatedStamp date={storyUpdated(story)} />
        <Link prefetch={false} href={story.path} className="index-cta">
          Read the story →
        </Link>
      </div>
      <Link prefetch={false} href={story.path}>
        <Image
          src={image.url}
          alt={image.alt}
          width={1200}
          height={630}
          sizes="(max-width:700px) 90vw, 45vw"
          loading="eager"
        />
      </Link>
    </section>
  );
}
