import Link from "next/link";
export default function NotFound() {
  return (
    <section className="index-heading">
      <span className="eyebrow">404 / PAGE NOT FOUND</span>
      <h1>There’s more to explore.</h1>
      <p>This page could not be found.</p>
      <Link className="index-cta" href="/search/">
        Search the magazine ↗
      </Link>
    </section>
  );
}
