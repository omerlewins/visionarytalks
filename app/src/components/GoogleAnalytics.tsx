"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};
const denied = {
  analytics_storage: "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
};
export function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  const pathname = usePathname(),
    [choice, setChoice] = useState<string | null>(null),
    [loaded, setLoaded] = useState(false),
    [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("vt-analytics-consent");
      setChoice(saved === "granted" || saved === "denied" ? saved : null);
    } catch {}
    setLoaded(true);
  }, []);
  function choose(value: string) {
    try {
      localStorage.setItem("vt-analytics-consent", value);
    } catch {}
    setChoice(value);
    (window as unknown as Record<string, unknown>)[
      "ga-disable-" + measurementId
    ] = value !== "granted";
    const w = window as AnalyticsWindow;
    w.gtag?.("consent", "update", { ...denied, analytics_storage: value });
  }
  function initialize() {
    const w = window as AnalyticsWindow;
    w.dataLayer = w.dataLayer ?? [];
    w.gtag =
      w.gtag ??
      function () {
        w.dataLayer!.push(arguments);
      };
    w.gtag("consent", "default", denied);
    w.gtag("consent", "update", { ...denied, analytics_storage: "granted" });
    w.gtag("js", new Date());
    w.gtag("config", measurementId, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });
    setReady(true);
  }
  useEffect(() => {
    if (ready && choice === "granted")
      (window as AnalyticsWindow).gtag?.("event", "page_view", {
        send_to: measurementId,
        page_location: window.location.origin + pathname,
        page_title: document.title,
      });
  }, [ready, choice, pathname, measurementId]);
  if (!loaded) return null;
  return (
    <>
      {choice === "granted" && (
        <Script
          id="vt-ga4"
          src={"https://www.googletagmanager.com/gtag/js?id=" + measurementId}
          strategy="afterInteractive"
          onReady={initialize}
        />
      )}
      <aside
        className="analytics-preferences"
        aria-label="Analytics preferences"
      >
        {choice === null ? (
          <>
            <p>
              Allow analytics cookies to help us understand which stories
              readers use?
            </p>
            <button type="button" onClick={() => choose("granted")}>
              Allow analytics
            </button>
            <button type="button" onClick={() => choose("denied")}>
              Decline
            </button>
          </>
        ) : (
          <button type="button" onClick={() => setChoice(null)}>
            Analytics preferences
          </button>
        )}
      </aside>
    </>
  );
}
