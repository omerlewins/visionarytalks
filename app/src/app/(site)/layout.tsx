import type { Metadata } from "next";
import "@/styles/reference.css";
import "@/styles/ownership.css";
import "@/styles/tracker-reference.css";
import "@/styles/production.css";
import { Header, Footer } from "@/components/Shell";
import { isDemo } from "@/lib/content";
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "Visionary Talks — Companies. Money. Careers.",
    template: "%s | Visionary Talks",
  },
  description:
    "The stories behind the businesses, people, and industries that shape our lives.",
  robots: {
    index: process.env.APP_ENV === "production",
    follow: process.env.APP_ENV === "production",
  },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {isDemo() && (
          <div className="demo-banner">
            DESIGN PREVIEW · Reference fixtures, not published reporting
          </div>
        )}
        <Header />
        <main id="main" className="page-width" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
