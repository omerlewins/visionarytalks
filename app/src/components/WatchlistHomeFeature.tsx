import Link from "next/link";
import Image from "next/image";
import { aiWatchlist } from "@/lib/ai-watchlist";
import portraits from "@/data/watchlist-portraits.json";

export function WatchlistHomeFeature() {
  const selection = [23, 25, 43, 69, 84, 96].map((number) => ({
    person: aiWatchlist.people.find((p) => p.number === number)!,
    portrait: portraits.find((p) => p.number === number)!,
  }));
  return (
    <section className="home-watchlist" aria-labelledby="home-watchlist-title">
      <div className="home-watchlist-copy">
        <span className="eyebrow">LEADERS / THE 2027 WATCHLIST</span>
        <h2 id="home-watchlist-title">
          100 AI people.
          <br />
          <em>The bets behind them.</em>
        </h2>
        <p>
          Meet the researchers, builders and voices I’m watching into 2027. The
          work, the evidence, and the test each case needs to pass.
        </p>
        <Link href="/ai-people-to-watch/" className="index-cta">
          Explore the 2027 watchlist ↗
        </Link>
        <Link
          href="/ai-people-to-watch/#suggest-person"
          className="home-watchlist-nominate"
        >
          Who am I missing? Nominate someone ↗
        </Link>
      </div>
      <div className="home-watchlist-faces">
        <div className="home-watchlist-portraits">
          {selection.map(({ person, portrait }) => (
            <Link key={person.id} href={`/ai-people-to-watch/#${person.id}`}>
              <Image
                src={portrait.src}
                alt={`AI editorial illustration of ${person.name}`}
                width={320}
                height={320}
                sizes="(max-width:700px) 26vw, 150px"
              />
              <span>{person.name}</span>
            </Link>
          ))}
        </div>
        <p>
          AI editorial illustrations · Six faces from a 100-person selection
        </p>
      </div>
    </section>
  );
}
