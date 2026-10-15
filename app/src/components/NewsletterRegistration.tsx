"use client";
import { useState, useId } from "react";
import Link from "next/link";
export function NewsletterRegistration() {
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);
  return (
    <div className="newsletter-registration">
      <p>One ownership story, every Thursday. Sharp, sourced, 4 minutes.</p>
      {saved ? (
        <p className="newsletter-result" role="status">
          {message}
        </p>
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (busy) return;
            const form = e.currentTarget;
            const values = new FormData(form);
            setBusy(true);
            setMessage("");
            try {
              const r = await fetch("/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email: values.get("email"),
                  consent: values.get("consent") === "on",
                  website: values.get("website") ?? "",
                  sourcePath: window.location.pathname,
                }),
              });
              const data = await r.json();
              setMessage(data.message);
              if (r.ok) {
                setSaved(true);
                form.reset();
              }
            } catch {
              setMessage("Registration couldn’t be saved. Please try again.");
            } finally {
              setBusy(false);
            }
          }}
        >
          <label htmlFor={id + "-email"}>Email address</label>
          <div className="newsletter-input-row">
            <input
              id={id + "-email"}
              type="email"
              name="email"
              autoComplete="email"
              required
              maxLength={254}
              placeholder="you@example.com"
            />
            <button type="submit" disabled={busy}>
              {busy ? "Saving…" : "Join the Brief ↗"}
            </button>
          </div>
          <div className="newsletter-trap" aria-hidden="true">
            <label htmlFor={id + "-website"}>Leave this empty</label>
            <input
              id={id + "-website"}
              name="website"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>
          <label className="newsletter-consent">
            <input type="checkbox" name="consent" required />
            I’d like to receive the Visionary Brief by email. I can withdraw my
            consent at any time.
          </label>
          <p className="newsletter-privacy">
            Read the{" "}
            <Link href="/newsletter-privacy/">newsletter privacy notice</Link>.
            We save your email and consent in our CMS. No email is sent at
            registration.
          </p>
          {message && (
            <p className="newsletter-result" role="alert">
              {message}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
