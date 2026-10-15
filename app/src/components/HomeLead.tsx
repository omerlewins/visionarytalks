import Link from "next/link";
import Image from "next/image";
import type { Story } from "@/lib/domain";
import {
  editorialText,
  homepageEdition,
  relativeUpdated,
  storyUpdated,
  watchlistPath,
  watchlistDek,
  ownershipUpdates,
  type OwnershipUpdate,
} from "@/lib/home-editorial";
import { storyFeaturedImage } from "@/lib/story-image";
import { UpdatedStamp } from "./UpdatedStamp";

export function HomeLead({ stories }: { stories: Story[] }) {
  const { lead, latest } = homepageEdition(stories);
  const now = new Date();
  if (!lead)
    return (
      <section className="lead-edition">
        <h1>The next investigation is on its way.</h1>
      </section>
    );
  const cover = storyFeaturedImage(lead);
  return (
    <section
      className="lead-edition"
      aria-label="Lead investigation and latest stories"
    >
      <article
        className={`lead-story ${lead.kind === "leader" ? "lead-portrait" : ""}`}
      >
        <div className="lead-story-kicker">
          <span className="eyebrow">
            {editorialText(lead.category)} / THE LEAD
          </span>
          <UpdatedStamp date={storyUpdated(lead)} />
        </div>
        <h1>
          <Link href={lead.path} prefetch={false}>{editorialText(lead.title)}</Link>
        </h1>
        <p className="lead-dek">{editorialText(lead.dek)}</p>
        <Link
          className="lead-illustration"
          href={lead.path}
          prefetch={false}
          aria-label={`Read ${editorialText(lead.title)}`}
        >
          <Image
            src={cover.url}
            alt={editorialText(cover.alt)}
            width={lead.kind === "leader" ? 1024 : 1200}
            height={lead.kind === "leader" ? 1536 : 630}
            preload
            sizes={lead.kind === "leader" ? "(max-width:800px) 32vw, 20vw" : "(max-width:800px) 90vw, 60vw"}
          />
        </Link>
        <div className="lead-story-foot">
          <Link href={lead.path} prefetch={false}>
            Read the investigation <span aria-hidden="true">↗</span>
          </Link>
          <span>
            {cover.credit
              ? editorialText(cover.credit)
              : "VISIONARY TALKS / EDITORIAL ART"}
          </span>
        </div>
      </article>
      <aside className="latest-rail" aria-labelledby="latest-heading">
        <div className="latest-rail-heading">
          <h2 id="latest-heading">Latest</h2>
          <span>FROM THE NEWSROOM</span>
        </div>
        <ol>
          {latest.map((s) => (
            <li key={s.id}>
              <div>
                <span className="eyebrow">{editorialText(s.category)}</span>
                <time dateTime={storyUpdated(s)}>
                  {relativeUpdated(storyUpdated(s)!, now)}
                </time>
              </div>
              <h3>
                <Link href={s.path} prefetch={false}>{editorialText(s.title)}</Link>
              </h3>
              {s.path === watchlistPath && <p>{watchlistDek}</p>}
              <UpdatedStamp date={storyUpdated(s)} />
            </li>
          ))}
        </ol>
      </aside>
    </section>
  );
}
export function OwnershipNewsroom({
  stories,
  updates,
  picks,
}: {
  stories: Story[];
  updates?: OwnershipUpdate[] | null;
  picks?: (string | number | { id: string | number })[] | null;
}) {
  const changes = ownershipUpdates(updates, stories);
  const mostRead = (picks || [])
    .flatMap((id) =>
      stories.filter(
        (s) => s.id === String(typeof id === "object" ? id.id : id),
      ),
    )
    .slice(0, 5);
  return (
    <div className="ownership-newsroom">
      <section
        className="ownership-week"
        aria-labelledby="ownership-week-title"
      >
        <div className="newsroom-box-heading">
          <span className="eyebrow">THE OWNERSHIP NOTEBOOK</span>
          <h3 id="ownership-week-title">This week in ownership</h3>
          <p>
            Three changes worth following. Each event keeps its original date.
          </p>
        </div>
        <ol>
          {changes.map((item, i) => (
            <li key={item.path + item.eventDate}>
              <span className="newsroom-number">0{i + 1}</span>
              <div>
                <div className="event-meta">
                  <span>{item.status}</span>
                  <time dateTime={item.eventDate}>
                    {new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      timeZone: "UTC",
                    }).format(new Date(item.eventDate))}
                  </time>
                </div>
                <h4>
                  <Link href={item.path}>{editorialText(item.headline)}</Link>
                </h4>
              </div>
            </li>
          ))}
        </ol>
        {!changes.length && (
          <p className="newsroom-empty">
            The next ownership notebook is being prepared.
          </p>
        )}
      </section>
      <section className="most-read" aria-labelledby="most-read-title">
        <div className="newsroom-box-heading">
          <span className="eyebrow">KEEP READING</span>
          <h3 id="most-read-title">Most Read</h3>
          <p>Selected by the editor while readership rankings take shape.</p>
        </div>
        <ol>
          {mostRead.map((s, i) => (
            <li key={s.id}>
              <span className="newsroom-number">0{i + 1}</span>
              <div>
                <h4>
                  <Link href={s.path}>{editorialText(s.title)}</Link>
                </h4>
                <UpdatedStamp date={storyUpdated(s)} />
              </div>
            </li>
          ))}
        </ol>
        {!mostRead.length && (
          <p className="newsroom-empty">
            Our next reading selection is being prepared.
          </p>
        )}
      </section>
    </div>
  );
}
