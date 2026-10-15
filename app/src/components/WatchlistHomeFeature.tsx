import Link from "next/link";
import Image from "next/image";
import type { AIWatchlist } from "@/lib/ai-watchlist";
import portraits from "@/data/watchlist-portraits.json";
import { UpdatedStamp } from "./UpdatedStamp";

export function WatchlistHomeFeature({ article }: { article: AIWatchlist }) {
  const selection = [1, 23, 25, 40, 43, 69, 84, 91, 96, 2].map((number) => ({
    person: article.people.find((p) => p.number === number)!,
    portrait: portraits.find((p) => p.number === number)!,
  }));
  return (
    <section
      className="home-watchlist watchlist-hero"
      aria-labelledby="home-watchlist-title"
    >
      <div className="home-watchlist-copy">
        <span className="eyebrow">LEADERS / THE 2027 WATCHLIST</span>
        <h1 id="home-watchlist-title">
          100 AI people to watch <em>in 2027</em>
        </h1>
        <p>
          The researchers, engineers and founders building what comes next.
          Their education, career path and the numbers behind them.
        </p>
        <Link
          prefetch={false}
          href="/ai-people-to-watch/"
          className="index-cta"
        >
          See the 100 →
        </Link>
        <UpdatedStamp date={article.checked + "T12:00:00Z"} />
        <Link
          prefetch={false}
          href="/ai-people-to-watch/#suggest-person"
          className="home-watchlist-nominate"
        >
          Who am I missing? Nominate someone
        </Link>
      </div>
      <div className="home-watchlist-faces">
        <div className="home-watchlist-portraits">
          {selection.map(({ person, portrait }) => (
            <Link
              prefetch={false}
              key={person.id}
              href={`/ai-people-to-watch/#${person.id}`}
              data-person={person.id}
            >
              <Image
                src={portrait.src}
                alt={`AI editorial illustration of ${person.name}`}
                width={320}
                height={320}
                sizes="(max-width:700px) 106px, (max-width:1100px) 90px, 116px"
                loading="eager"
              />
              <span>{person.name}</span>
              <small>{person.organization}</small>
            </Link>
          ))}
        </div>
        <p>
          AI editorial illustrations · Ten faces from a 100-person selection
        </p>
      </div>
    </section>
  );
}
