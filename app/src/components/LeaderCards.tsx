import Link from "next/link";
import Image from "next/image";
import {
  leaderPortrait,
  dateLabel,
  type LeaderSummary,
} from "@/lib/leader-display";
export function LeaderCard({
  leader: p,
  index = 0,
}: {
  leader: LeaderSummary;
  index?: number;
}) {
  const portrait = leaderPortrait(p);
  return (
    <article className="leader-file">
      <Link
        className="leader-file-art"
        href={p.path}
        aria-label={"Read " + p.name + " profile"}
      >
        <span className="leader-file-index">
          {String(index + 1).padStart(2, "0")} / LEADERS
        </span>
        {portrait ? (
          <Image
            src={portrait}
            alt={"AI editorial illustration of " + p.name}
            width={1024}
            height={1536}
            sizes="(max-width:640px) 90vw, (max-width:1000px) 45vw, 25vw"
          />
        ) : (
          <span className="leader-initials" aria-hidden="true">
            {p.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </span>
        )}
        <span className="leader-art-caption">
          {portrait ? "AI EDITORIAL ILLUSTRATION" : "THE COMPANY BUILDERS"}
        </span>
      </Link>
      <div className="leader-file-copy">
        <span className="eyebrow">{p.company}</span>
        <h3>
          <Link href={p.path}>{p.name}</Link>
        </h3>
        <p>{p.hook}.</p>
        <div className="leader-file-foot">
          <span>
            {p.wealth.value === null
              ? "Wealth not established"
              : p.wealth.display + " · estimate"}
            {p.wealth.value !== null && (
              <small>
                {p.wealth.basis.includes("Forbes") ? "Forbes" : "Estimate"} ·{" "}
                {dateLabel(p.wealth.date)}
              </small>
            )}
          </span>
          <Link href={p.path} aria-label={"Explore " + p.name}>
            ↗
          </Link>
        </div>
      </div>
    </article>
  );
}
export function FeaturedLeaders({ leaders }: { leaders: LeaderSummary[] }) {
  return (
    <div className="leader-feature-grid">
      {leaders.map((p, i) => (
        <LeaderCard key={p.slug} leader={p} index={i} />
      ))}
    </div>
  );
}
