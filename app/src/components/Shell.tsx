import Link from "next/link";
import { NewsletterRegistration } from "./NewsletterRegistration";
import { publicationSocials } from "@/lib/publication-socials";
import { canExposeWatchlist } from "@/lib/ai-watchlist";
const nav = [
  ["Who owns", "/category/ownership/"],
  ["Business", "/category/business/"],
  ["Careers", "/category/careers/"],
  ["Leaders", "/leaders/"],
  ["Charts & Data", "/ai-salaries/"],
  ["AI Tracker", "/ai-companies/"],
];
export function Header({
  showCompanyTracker = true,
}: {
  showCompanyTracker?: boolean;
}) {
  const visibleNav = nav.filter(
    ([, path]) => showCompanyTracker || path !== "/ai-companies/",
  );
  const showWatchlist = canExposeWatchlist(process.env);
  return (
    <header className="site-header page-width" id="top">
      <a className="skip-link" href="#main" tabIndex={0}>
        Skip to content
      </a>
      <div className="utility">
        <span>A MAGAZINE FOR THE BUSINESS CURIOUS</span>
        <span className="date">BUSINESS, EXPLAINED.</span>
        <div className="utility-actions">
          <Link href="/search/">Search</Link>
          <Link href="/newsletter/">Newsletter ↗</Link>
        </div>
      </div>
      <div className="masthead">
        <Link href="/" className="wordmark">
          VISIONARY<span> TALKS</span>
        </Link>
        <p>Companies. Money. Careers.</p>
      </div>
      <nav className="main-nav desktop-nav" aria-label="Sections">
        {visibleNav.map(([n, p]) =>
          p === "/leaders/" && showWatchlist ? (
            <details className="leaders-nav-group" key={p}>
              <summary>
                Leaders <span aria-hidden="true">⌄</span>
              </summary>
              <div className="leaders-nav-submenu">
                <Link href={p}>Leader profiles ↗</Link>
                <Link href="/ai-people-to-watch/">
                  100 AI people to watch in 2027 ↗
                </Link>
              </div>
            </details>
          ) : (
            <Link key={p} href={p}>
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
              <Link href={p}>{n}</Link>
              {p === "/leaders/" && showWatchlist && (
                <Link
                  className="mobile-nav-subitem"
                  href="/ai-people-to-watch/"
                >
                  ↳ 100 AI people to watch in 2027
                </Link>
              )}
            </div>
          ))}
          <Link href="/search/">Search</Link>
        </nav>
      </details>
    </header>
  );
}
export function Newsletter() {
  return (
    <section className="brief" id="brief">
      <div>
        <span className="eyebrow">THE VISIONARY BRIEF</span>
        <h2>
          A little perspective.
          <br />
          In your inbox.
        </h2>
        <p>
          The stories behind the businesses, people, and industries shaping your
          world.
        </p>
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
            <Link className="footer-logo" href="/">
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
              <Link key={n} href={`/${n.toLowerCase().replaceAll(" ", "-")}/`}>
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
          <nav aria-label="Visionary Talks social pages">
            {publicationSocials.map((social) =>
              social.url ? (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.name}
                  <span aria-hidden="true">↗</span>
                </a>
              ) : (
                <span className="footer-social-pending" key={social.name}>
                  {social.name}
                  <small>Coming soon</small>
                </span>
              ),
            )}
          </nav>
        </div>
        <p className="footer-ai-note">
          We use AI to assist research, writing and some illustrations.{" "}
          <Link href="/ai-disclosure/">Read our AI disclosure ↗</Link>
        </p>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Visionary Talks</span>
          <a href="#top">Back to top ↑</a>
        </div>
      </div>
    </footer>
  );
}
