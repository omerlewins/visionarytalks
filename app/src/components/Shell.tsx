import Link from "next/link";
import { NewsletterRegistration } from "./NewsletterRegistration";
import { SocialLinks } from "./SocialLinks";
import { editionLabel, figureDate, type Figure } from "@/lib/home-editorial";
const nav = [
  ["Who owns", "/category/ownership/"],
  ["Business", "/category/business/"],
  ["Careers", "/category/careers/"],
  ["Leaders", "/leaders/"],
  ["AI Salaries", "/ai-salaries/"],
  ["AI Tracker", "/ai-companies/"],
];
export function Header({
  showCompanyTracker = true,
  showWatchlist = false,
  updated,
  figures = [],
}: {
  showCompanyTracker?: boolean;
  showWatchlist?: boolean;
  updated?: string;
  figures?: Figure[];
}) {
  const visibleNav = nav.filter(
    ([, path]) => showCompanyTracker || path !== "/ai-companies/",
  );
  return (
    <header className="site-header page-width" id="top">
      <a className="skip-link" href="#main" tabIndex={0}>
        Skip to content
      </a>
      <div className="utility">
        <span>A MAGAZINE FOR THE BUSINESS CURIOUS</span>
        {updated && (
          <time className="date edition-date" dateTime={updated}>
            {editionLabel(updated)}
          </time>
        )}
        <div className="utility-actions">
          <Link prefetch={false} href="/search/">
            Search
          </Link>
          <Link prefetch={false} href="/newsletter/">
            Newsletter ↗
          </Link>
          <SocialLinks compact />
        </div>
      </div>
      <div className="masthead">
        <Link prefetch={false} href="/" className="wordmark">
          VISIONARY<span> TALKS</span>
        </Link>
        <p>Who owns it. Who runs it. What it&apos;s really worth.</p>
      </div>
      <nav className="main-nav desktop-nav" aria-label="Sections">
        {visibleNav.map(([n, p]) =>
          p === "/leaders/" && showWatchlist ? (
            <details className="leaders-nav-group" key={p}>
              <summary>
                Leaders <span aria-hidden="true">⌄</span>
              </summary>
              <div className="leaders-nav-submenu">
                <Link prefetch={false} href={p}>
                  Leader profiles ↗
                </Link>
                <Link prefetch={false} href="/ai-people-to-watch/">
                  100 AI people to watch in 2027 ↗
                </Link>
              </div>
            </details>
          ) : (
            <Link prefetch={false} key={p} href={p}>
              {n}
            </Link>
          ),
        )}
      </nav>
      <details className="mobile-nav">
        <summary>
          Explore the magazine <span>Menu +</span>
        </summary>
        <nav aria-label="Mobile sections">
          {visibleNav.map(([n, p]) => (
            <div key={p}>
              <Link prefetch={false} href={p}>
                {n}
              </Link>
              {p === "/leaders/" && showWatchlist && (
                <Link
                  prefetch={false}
                  className="mobile-nav-subitem"
                  href="/ai-people-to-watch/"
                >
                  ↳ 100 AI people to watch in 2027
                </Link>
              )}
            </div>
          ))}
          <Link prefetch={false} href="/search/">
            Search
          </Link>
        </nav>
      </details>
      {!!figures.length && (
        <div
          className="figures-strip"
          aria-label="Dated company financing figures"
          tabIndex={0}
        >
          <span className="figures-label">THE NUMBERS / DATED, SOURCED</span>
          <ul>
            {figures.map((f) => (
              <li key={f.path}>
                <Link
                  prefetch={false}
                  href={f.path}
                  title={`${f.name}: ${f.measure}, ${figureDate(f.date)}`}
                >
                  <strong>
                    {f.name} <b>{f.figure}</b>
                  </strong>
                  <span>
                    {figureDate(f.date)} · {f.measure}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
export function Newsletter({
  kicker = "THE VISIONARY BRIEF",
}: { kicker?: string } = {}) {
  return (
    <section className="brief" id="brief">
      <div>
        <span className="eyebrow">{kicker}</span>
        <h2>
          A little perspective.
          <br />
          In your inbox.
        </h2>
        <p>A closer look at the companies behind the headlines.</p>
      </div>
      <NewsletterRegistration />
    </section>
  );
}
export function Ad() {
  return (
    <aside className="ad-slot" aria-label="Advertisement placement">
      <span>ADVERTISEMENT</span>
      <div>Reserved for a clearly labeled sponsor message</div>
    </aside>
  );
}
export function Footer() {
  return (
    <footer className="footer">
      <div className="page-width">
        <div className="footer-top">
          <div>
            <Link prefetch={false} className="footer-logo" href="/">
              VISIONARY TALKS
            </Link>
            <p>Companies. Money. Careers.</p>
          </div>
          <nav className="footer-links" aria-label="Publication">
            {[
              "About",
              "Editorial standards",
              "AI disclosure",
              "Contact",
              "Corrections",
              "Advertise",
              "Privacy",
              "Terms",
            ].map((n) => (
              <Link
                prefetch={false}
                key={n}
                href={`/${n.toLowerCase().replaceAll(" ", "-")}/`}
              >
                {n}
              </Link>
            ))}
          </nav>
        </div>
        <div className="footer-social">
          <div>
            <span className="eyebrow">FOLLOW THE INVESTIGATIONS</span>
            <p>More ways to look a little closer.</p>
          </div>
          <SocialLinks />
        </div>
        <p className="footer-ai-note">
          We use AI to assist research, writing and some illustrations.{" "}
          <Link prefetch={false} href="/ai-disclosure/">
            Read our AI disclosure ↗
          </Link>
        </p>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Visionary Talks</span>
          <a href="#top">Back to top ↑</a>
        </div>
      </div>
    </footer>
  );
}
