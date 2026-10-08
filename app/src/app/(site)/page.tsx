import Image from "next/image";
import Link from "next/link";
import { stories, companies, isDemo, cms } from "@/lib/content";
import { StoryCard } from "@/components/Story";
import { Tracker } from "@/components/Tracker";
import { Ad, Newsletter } from "@/components/Shell";
import { Chart } from "@/components/Chart";
import { SalaryTracker } from "@/components/SalaryTracker";
import { salaryFixtures } from "@/data/salary-fixtures";
export const dynamic = "force-dynamic";
export default async function Home() {
  const [all, rows] = await Promise.all([stories(), companies()]);
  const settings = isDemo()
    ? undefined
    : await (
        await cms()
      ).findGlobal({ slug: "site-settings", overrideAccess: false, depth: 0 });
  const picks = settings?.featuredStories as (string | number)[] | undefined;
  const featured = picks?.length
    ? all.filter((s) => picks.some((id) => String(id) === s.id))
    : all;
  const ownership = all.filter((s) => s.kind === "ownership");
  const leaders = all.filter((s) => s.kind === "leader");
  return (
    <>
      <section
        className="illustrated-hero hero-dynamic"
        aria-labelledby="magazine-title"
      >
        <div className="hero-ink hero-ink--left" aria-hidden="true">
          <Image
            src="/reference/hero-human-ai.png"
            alt=""
            width={1536}
            height={1024}
            priority
            sizes="(max-width:700px) 50vw, 30vw"
          />
        </div>
        <div className="magazine-hero-copy">
          <span className="eyebrow">LOOK A LITTLE CLOSER</span>
          <h1 id="magazine-title">
            {settings?.heroTitle ?? (
              <>
                The stories behind
                <br />
                the world we live in.
              </>
            )}
          </h1>
          <p>
            {settings?.heroDescription ??
              "A magazine uncovering the businesses, people, and industries that shape our lives."}
          </p>
          <div className="hero-reading-links">
            <a className="read-edition" href="#latest-stories">
              Explore the stories ↓
            </a>
            <a href="#brief">Get the Visionary Brief ↗</a>
          </div>
        </div>
        <div className="hero-ink hero-ink--right" aria-hidden="true">
          <Image
            src="/reference/hero-human-industry.png"
            alt=""
            width={1536}
            height={1024}
            priority
            sizes="(max-width:700px) 50vw, 30vw"
          />
        </div>
      </section>
      <section className="latest-stories" id="latest-stories">
        <div className="latest-heading">
          <h2>Worth a closer look</h2>
          <span>FROM THE EDITORS</span>
        </div>
        <div className="latest-story-grid">
          {featured.slice(0, 3).map((s) => (
            <StoryCard key={s.id} story={s} />
          ))}
        </div>
        {!all.length && (
          <p className="empty-state">Our next edition is being prepared.</p>
        )}
      </section>
      <section className="section company-files" id="ownership">
        <div className="section-heading">
          <div>
            <span className="eyebrow">01 / OWNERSHIP</span>
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
              <Link className="company-file-art" href={ownership[0].path}>
                <div className="file-art-meta">
                  <span>THE OWNERSHIP FILE</span>
                  <span>001</span>
                </div>
                <strong>
                  {ownership[0].title.replace("Who owns ", "").replace("?", "")}
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
              </Link>
              <StoryCard story={ownership[0]} />
            </article>
          )}
          <div className="company-file-stack">
            {all
              .filter((s) => s.id !== ownership[0]?.id)
              .slice(0, 3)
              .map((s) => (
                <StoryCard key={s.id} story={s} />
              ))}
          </div>
        </div>
      </section>
      <section className="section home-ai-index">
        <div className="home-ai-intro">
          <span className="eyebrow">THE VISIONARY INDEX / AI COMPANIES</span>
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
        <Tracker rows={rows} preview />
      </section>
      {isDemo() && (
        <section className="section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">BUSINESS IN NUMBERS</span>
              <h2>One chart. One idea.</h2>
            </div>
            <p>Evidence with a clear point of view.</p>
          </div>
          <div className="chart-panel">
            <div className="chart-intro">
              <span className="eyebrow">APPLE / REFERENCE FIXTURE</span>
              <h3>The business beyond the hardware.</h3>
              <p>
                The approved concept’s services-share chart, rendered from data.
                These values require source review before publication.
              </p>
            </div>
            <Chart
              metrics={[18.7, 19.8, 22.2, 24.6, 26.2].map((value, index) => ({
                label: "Services share",
                value,
                unit: "%",
                period: `FY${2021 + index}`,
                definition: "Services share of net sales",
                basis: "calculated",
                sourceIds: ["home-apple"],
              }))}
            />
          </div>
          <p className="source" id="source-home-apple">
            Design reference: Apple Forms 10-K.{" "}
            <a href="https://www.sec.gov/Archives/edgar/data/320193/000032019325000079/aapl-20250927.htm">
              Review the FY2025 filing ↗
            </a>
          </p>
        </section>
      )}
      {!isDemo() && all.find((s) => s.metrics?.length) && (
        <section className="section">
          <div className="section-heading">
            <h2>One chart. One idea.</h2>
          </div>
          <StoryCard story={all.find((s) => s.metrics?.length)!} />
        </section>
      )}
      <Ad />
      <section className="section careers-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">02 / CAREERS</span>
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
            <div>
              <b>Cash</b>
              <span>+</span>
              <b>Equity</b>
              <span>+</span>
              <b>Benefits</b>
            </div>
            <p>Then account for your time.</p>
          </div>
          <div>
            {all
              .filter((s) => s.kind === "salary")
              .map((s) => (
                <StoryCard key={s.id} story={s} />
              ))}
            <Link className="index-cta" href="/ai-salaries/">
              Explore the AI salaries tracker ↗
            </Link>
          </div>
        </div>
      </section>
      {isDemo() && (
        <section className="section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                CAREERS & DATA / REFERENCE FIXTURES
              </span>
              <h2>AI salaries tracker</h2>
            </div>
            <Link href="/ai-salaries/">Explore all observations ↗</Link>
          </div>
          <SalaryTracker
            rows={salaryFixtures}
            initialOccupation={salaryFixtures[0].occupation}
          />
        </section>
      )}
      <section className="section home-leaders" id="people">
        <div className="section-heading">
          <div>
            <span className="eyebrow">03 / PEOPLE</span>
            <h2>The Leaders</h2>
          </div>
          <p>The people behind the decisions that shape the world.</p>
        </div>
        <div className="home-leader-grid">
          {(isDemo()
            ? [
                "Satya Nadella",
                "Jensen Huang",
                "Melanie Perkins",
                "Patrick Collison",
              ]
            : leaders.map((l) => l.title)
          ).map((name, i) => {
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
      </section>
      <Newsletter />
    </>
  );
}
