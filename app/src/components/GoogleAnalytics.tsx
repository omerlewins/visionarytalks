"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import Link from "next/link";
import {
  initialAnalyticsChoice,
  type AnalyticsChoice,
} from "@/lib/analytics-preferences";
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
function clearAnalyticsCookies() {
  const names = document.cookie
    .split(";")
    .map((value) => value.trim().split("=")[0])
    .filter((name) => /^_ga(?:_|$)/.test(name));
  const hostname = location.hostname.split(".");
  for (const name of names) {
    document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
    for (let i = 0; i < hostname.length - 1; i++) {
      const domain = hostname.slice(i).join(".");
      for (const prefix of ["", "."])
        document.cookie = `${name}=; Max-Age=0; Path=/; Domain=${prefix}${domain}; SameSite=Lax`;
    }
  }
}
export function GoogleAnalytics({
  measurementId,
  privacySignal = false,
}: {
  measurementId: string;
  privacySignal?: boolean;
}) {
  const pathname = usePathname();
  const [choice, setChoice] = useState<AnalyticsChoice>(null),
    [loaded, setLoaded] = useState(false),
    [ready, setReady] = useState(false),
    [blocked, setBlocked] = useState(false);
  const current = useRef<AnalyticsChoice>(null);
  const configured = useRef(false);
  function setDisabled(value: boolean) {
    (window as unknown as Record<string, unknown>)[
      "ga-disable-" + measurementId
    ] = value;
  }
  function prepare(selected: AnalyticsChoice) {
    if (configured.current) return;
    const w = window as AnalyticsWindow;
    w.dataLayer = w.dataLayer ?? [];
    w.gtag =
      w.gtag ??
      function () {
        w.dataLayer!.push(arguments);
      };
    // Queue the default BEFORE rendering/loading Google's external script.
    w.gtag("consent", "default", denied);
    if (selected === "granted")
      w.gtag("consent", "update", { ...denied, analytics_storage: "granted" });
    w.gtag("js", new Date());
    w.gtag("config", measurementId, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      page_location: window.location.origin + pathname,
    });
    configured.current = true;
  }
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("vt-analytics-consent");
    } catch {}
    const signal =
      privacySignal ||
      (navigator as Navigator & { globalPrivacyControl?: boolean })
        .globalPrivacyControl === true ||
      navigator.doNotTrack === "1" ||
      navigator.doNotTrack === "yes";
    const selected = initialAnalyticsChoice(saved, signal);
    current.current = selected;
    setDisabled(selected === "denied");
    setChoice(selected);
    setBlocked(signal);
    if (signal) {
      try {
        localStorage.setItem("vt-analytics-consent", "denied");
      } catch {}
    }
    if (selected === "denied") {
      (window as AnalyticsWindow).gtag?.("consent", "update", denied);
      clearAnalyticsCookies();
    } else prepare(selected);
    setLoaded(true);
  }, [privacySignal, measurementId]);
  function choose(value: "granted" | "denied") {
    if (blocked && value === "granted") return;
    current.current = value;
    setDisabled(value !== "granted");
    setChoice(value);
    try {
      localStorage.setItem("vt-analytics-consent", value);
    } catch {}
    if (value === "granted") prepare(value);
    (window as AnalyticsWindow).gtag?.("consent", "update", {
      ...denied,
      analytics_storage: value,
    });
    if (value === "denied") clearAnalyticsCookies();
  }
  function initialize() {
    if (current.current === "denied") {
      setDisabled(true);
      return;
    }
    setReady(true);
  }
  useEffect(() => {
    if (ready && current.current !== "denied")
      (window as AnalyticsWindow).gtag?.("event", "page_view", {
        send_to: measurementId,
        page_location: window.location.origin + pathname,
        page_title: document.title,
      });
  }, [ready, pathname, measurementId]);
  if (!loaded) return null;
  return (
    <>
      {choice !== "denied" && (
        <Script
          id="vt-ga4"
          src={"https://www.googletagmanager.com/gtag/js?id=" + measurementId}
          strategy={pathname === "/" ? "lazyOnload" : "afterInteractive"}
          onReady={initialize}
        />
      )}
      <aside
        className="analytics-preferences"
        aria-label="Analytics preferences"
      >
        {blocked ? (
          <p>
            Analytics is off because your browser requests privacy.{" "}
            <Link href="/privacy/">Privacy notice</Link>
          </p>
        ) : choice === "granted" ? (
          <>
            <p>
              Analytics cookies are enabled. You can opt out at any time.{" "}
              <Link href="/privacy/">Privacy notice</Link>
            </p>
            <button type="button" onClick={() => choose("denied")}>
              Opt out of analytics
            </button>
          </>
        ) : choice === "denied" ? (
          <>
            <p>
              Analytics is off. <Link href="/privacy/">Privacy notice</Link>
            </p>
            <button type="button" onClick={() => choose("granted")}>
              Allow analytics cookies
            </button>
          </>
        ) : (
          <>
            <p>
              We send cookieless readership signals to Google Analytics. You can
              opt out or allow analytics cookies.{" "}
              <Link href="/privacy/">Privacy notice</Link>
            </p>
            <button type="button" onClick={() => choose("granted")}>
              Allow analytics cookies
            </button>
            <button type="button" onClick={() => choose("denied")}>
              Opt out of analytics
            </button>
          </>
        )}
      </aside>
    </>
  );
}
