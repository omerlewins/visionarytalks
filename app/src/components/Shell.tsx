import Link from "next/link";
import { NewsletterRegistration } from "./NewsletterRegistration";
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
        {visibleNav.map(([n, p]) => (
          <Link key={p} href={p}>
            {n}
          </Link>
        ))}
      </nav>
      <details className="mobile-nav">
        <summary>
          Explore the magazine <span>Menu +</span>
        </summary>
        <nav aria-label="Mobile sections">
          {visibleNav.map(([n, p]) => (
            <Link key={p} href={p}>
              {n}
            </Link>
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
