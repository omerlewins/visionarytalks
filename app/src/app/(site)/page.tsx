import { publicLeaderProfiles } from "@/lib/leader-content";
import { isLeadersReview } from "@/lib/leaders-review";
import { FeaturedLeaders } from "@/components/LeaderCards";
import { featuredLeaders } from "@/lib/leaders";
import Image from "next/image";
import Link from "next/link";
import { storyTeasers, companies, isDemo, cms } from "@/lib/content";
import { HomeLead, OwnershipNewsroom } from "@/components/HomeLead";
import {
  storyUpdated,
  updatedStories,
  homepageEdition,
} from "@/lib/home-editorial";
import { UpdatedStamp } from "@/components/UpdatedStamp";
import { StoryCard } from "@/components/StoryCard";
import { TrackerPreview } from "@/components/TrackerPreview";
import { Newsletter } from "@/components/Shell";
import { ownershipBrand } from "@/lib/ownership";
import { notFound } from "next/navigation";
import { loadWatchlist } from "@/lib/watchlist-content";
import { HomeHero } from "@/components/HomeHero";
import { HomeMoney } from "@/components/HomeMoney";
export const dynamic = "force-dynamic";
export const metadata = {
  other: { "p:domain_verify": "82d912d9494256eb147ff539476d0162" },
  alternates: { canonical: "https://visionarytalks.com/" },
  openGraph: {
    title: "Visionary Talks: Companies. Money. Careers.",
    description:
      "Investigate company ownership, wealth, AI businesses and careers through dated sources, data and independent financial research.",
    url: "https://visionarytalks.com/",
    images: ["/social-image/?path=%2F"],
  },
  description:
    "Investigate company ownership, wealth, AI businesses and careers through dated sources, data and independent financial research.",
};
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  // Old draft/query permalinks must not masquerade as successful homepage requests.
  if (
    query.p !== undefined ||
    query.page_id !== undefined ||
    query.preview !== undefined
  )
    notFound();
  const [all, rows, settings, publishedProfiles, watchlist] = await Promise.all(
    [
      storyTeasers(),
      companies(),
      isDemo()
        ? Promise.resolve(undefined)
        : cms().then((payload) =>
            payload.findGlobal({
              slug: "site-settings",
              overrideAccess: false,
              depth: 0,
            }),
          ),
      publicLeaderProfiles(),
      loadWatchlist(),
    ],
  );
  const ownership = updatedStories(all).filter((s) => s.kind === "ownership");
  const publicProfiles = isLeadersReview()
    ? featuredLeaders
    : publishedProfiles;
  const leaderFeatures = featuredLeaders.flatMap((p) =>
    publicProfiles.filter((l) => l.slug === p.slug),
  );
  const leaders = all.filter((s) => s.kind === "leader");
  const edition = homepageEdition(
    all,
    settings?.homepageHero,
    settings?.homepageLead,
  );
  return (
    <>
      <HomeHero story={edition.hero} watchlist={watchlist?.article} />
      <HomeLead
        stories={all}
        heroChoice={settings?.homepageHero}
        leadChoice={settings?.homepageLead}
      />
      <section className="section home-leaders" id="people">
        <div className="section-heading">
          <div>
            <span className="eyebrow">01 / LEADERS</span>
            <h2>The Leaders</h2>
          </div>
        </div>
        {leaderFeatures.length ? (
          <FeaturedLeaders leaders={leaderFeatures} />
        ) : (
          <div className="home-leader-grid">
            {leaders
              .map((l) => l.title)
              .map((name, i) => {
                const story = leaders.find((l) => l.title === name);
                const image =
                  story?.image ??
                  (isDemo()
                    ? `/reference/${name.toLowerCase().replace(" ", "-")}-illustration.png`
                    : undefined);
                return (
                  <article key={name} className="home-leader-card">
                    <div className="home-leader-portrait">
                      <span className="leader-card-number">0{i + 1}</span>
                      {image && (
                        <Image
                          src={image}
                          alt={`Editorial illustration of ${name}`}
                          width={1122}
                          height={1402}
                          sizes="(max-width:800px) 45vw, 24vw"
                        />
                      )}
                    </div>
                    <h3>{name}</h3>
                    <UpdatedStamp date={story && storyUpdated(story)} />
                    <p className="home-leader-theme">
                      A closer look at the person behind the business.
                    </p>
                    <div className="home-leader-bottom">
                      {story ? (
                        <Link className="home-leader-action" href={story.path}>
                          Explore the profile ↗
                        </Link>
                      ) : (
                        <span className="home-leader-pending">
                          Profile forthcoming
                        </span>
                      )}
                      <small>EDITORIAL ILLUSTRATION</small>
                    </div>
                  </article>
                );
              })}
          </div>
        )}
        <Link className="index-cta leaders-index-link" href="/leaders/">
          Explore the Leaders index ↗
        </Link>
      </section>
      <HomeMoney
        stories={all}
        leaders={publishedProfiles}
        selectedState={
          typeof query.state === "string" ? query.state : undefined
        }
      />
      <section className="section company-files" id="ownership">
        <div className="section-heading">
          <div>
            <span className="eyebrow">03 / OWNERSHIP</span>
            <h2>Behind the Brand</h2>
          </div>
          <p>
            You know the name.
            <br />
            Now meet the company behind it.
          </p>
        </div>
        <div className="company-files-grid">
          {ownership[0] && (
            <article className="company-file-feature">
              <Link
                className={`company-file-art ${ownership[0].image ? "company-file-illustrated" : ""}`}
                href={ownership[0].path}
              >
                {ownership[0].image ? (
                  <Image
                    src={ownership[0].image}
                    alt={ownership[0].imageAlt || ownership[0].title}
                    width={1400}
                    height={700}
                    sizes="(max-width:800px) 90vw, 55vw"
                  />
                ) : (
                  <>
                    <div className="file-art-meta">
                      <span>THE OWNERSHIP FILE</span>
                      <span>001</span>
                    </div>
                    <strong>
                      {ownershipBrand(ownership[0].title)}
                      <span>_</span>
                    </strong>
                    <div className="file-mini-chain">
                      <div>
                        <small>THE PRODUCT</small>
                        <b>The brand</b>
                      </div>
                      <div>
                        <small>THE BUSINESS</small>
                        <b>The entity</b>
                      </div>
                      <div>
                        <small>THE EVIDENCE</small>
                        <b>The sources</b>
                      </div>
                    </div>
                    <div className="file-art-bottom">
                      <span>OWNERSHIP, EXPLAINED</span>
                      <span>COMPANY FILE</span>
                    </div>
                  </>
                )}
              </Link>
              <StoryCard story={ownership[0]} />
            </article>
          )}
          <div className="company-file-stack">
            {ownership
              .filter((s) => s.id !== ownership[0]?.id)
              .slice(0, 3)
              .map((s) => (
                <StoryCard key={s.id} story={s} />
              ))}
          </div>
        </div>
        <OwnershipNewsroom
          stories={all}
          updates={settings?.ownershipUpdates}
          picks={settings?.mostReadStories}
        />
      </section>
      {!!rows.length && (
        <section className="section home-ai-index">
          <div className="home-ai-intro">
            <span className="eyebrow">04 / AI COMPANIES</span>
            <h2>
              Behind the hype.
              <br />
              <em>Inside the business.</em>
            </h2>
            <p>
              Track the companies, their verticals, and the numbers behind the
              headlines.
            </p>
            <Link className="index-cta" href="/ai-companies/">
              Explore the AI companies tracker ↗
            </Link>
          </div>
          <TrackerPreview rows={rows} />
        </section>
      )}
      <section className="section careers-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">05 / CAREERS</span>
            <h2>Work, considered.</h2>
          </div>
          <p>Clear reporting for consequential career decisions.</p>
        </div>
        <div className="careers-grid">
          <div className="compensation-editorial">
            <span>THE CAREER EQUATION</span>
            <h4>
              What is the
              <br />
              offer <em>really</em> worth?
            </h4>
            <div className="career-equation-cards">
              <div>
                <span>01 / TODAY</span>
                <b>Cash</b>
                <small>Salary & bonus</small>
              </div>
              <div>
                <span>02 / TOMORROW</span>
                <b>Equity</b>
                <small>Ownership & vesting</small>
              </div>
              <div>
                <span>03 / EVERY DAY</span>
                <b>Benefits</b>
                <small>Health, time & flexibility</small>
              </div>
            </div>
            <p>
              A good offer is more than its headline number. Understand the pay,
              the ownership and the life that comes with it.
            </p>
            <Link className="index-cta" href="/ai-salary-database/">
              Read the AI salary investigation ↗
            </Link>
          </div>
          <div className="home-career-stories">
            {all
              .filter((s) => s.kind === "salary")
              .slice(0, 3)
              .map((s) => (
                <StoryCard key={s.id} story={s} />
              ))}
            <Link className="index-cta" href="/ai-salaries/">
              Explore the AI salaries tracker ↗
            </Link>
          </div>
        </div>
      </section>
      <Newsletter kicker="06 / NEWSLETTER" />
    </>
  );
}
