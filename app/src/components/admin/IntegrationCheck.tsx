"use client";
import { useState } from "react";
export function IntegrationCheck() {
  const [busy, setBusy] = useState(false),
    [result, setResult] = useState<any>(null);
  async function check() {
    setBusy(true);
    try {
      const r = await fetch("/api/integrations/check", { cache: "no-store" });
      const data = await r.json();
      if (!r.ok)
        throw Error(
          r.status === 403
            ? "Only an administrator or editor can check integrations."
            : (data.error ?? "Connection check failed. Try again."),
        );
      setResult(data);
    } catch (e) {
      setResult({
        error: e instanceof Error ? e.message : "Connection failed",
      });
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      style={{
        padding: "24px",
        border: "1px solid var(--theme-elevation-150)",
        borderRadius: 8,
        marginBottom: 24,
      }}
    >
      <h3>Check Google connections</h3>
      <p>
        Save your property IDs first. The server uses a Google service account
        to read reports. Add its email to Search Console and as a Viewer in GA4;
        enable the Search Console and Analytics Data APIs in its Google Cloud
        project.
      </p>
      <p>
        Set <code>GOOGLE_SERVICE_ACCOUNT_JSON</code> in Vercel’s private
        environment settings using the service-account credential file. Never
        paste private keys into CMS fields.
      </p>
      <button type="button" disabled={busy} onClick={check}>
        {busy ? "Checking…" : "Check access & load report"}
      </button>
      {result?.serviceAccountEmail && (
        <p>
          Google account to grant access:{" "}
          <strong>{result.serviceAccountEmail}</strong>
        </p>
      )}
      {result?.error && <p role="alert">{result.error}</p>}
      {result && !result.error && (
        <>
          <p>
            Search Console: <strong>{result.searchConsole.status}</strong>
          </p>
          <p>{result.searchConsole.message}</p>
          {result.searchConsole.report && (
            <pre style={{ whiteSpace: "pre-wrap" }}>
              {JSON.stringify(result.searchConsole.report, null, 2)}
            </pre>
          )}
          <p>
            Google Analytics: <strong>{result.analytics.status}</strong>
          </p>
          <p>{result.analytics.message}</p>
          {result.analytics.report && (
            <pre style={{ whiteSpace: "pre-wrap" }}>
              {JSON.stringify(result.analytics.report, null, 2)}
            </pre>
          )}
          <small>
            Reports are fetched on demand. “Connected” means Google accepted the
            API request; it does not confirm website tracking or tag
            installation.
          </small>
        </>
      )}
    </section>
  );
}
