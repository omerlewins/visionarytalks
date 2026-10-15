"use client";

export function PersonSuggestion() {
  return (
    <section
      className="watch-suggestion"
      id="suggest-person"
      aria-labelledby="suggest-person-title"
    >
      <div>
        <span className="eyebrow">THE NEXT NAME STARTS WITH YOU</span>
        <h2 id="suggest-person-title">Who am I missing?</h2>
        <p>
          A researcher, builder or voice doing work I should investigate. Tell
          me who, and point me to something I can verify.
        </p>
        <p className="watch-suggestion-note">
          I review nominations independently. A suggestion does not guarantee
          inclusion, and this is not a paid placement list.
        </p>
      </div>
      <form
        action="mailto:daniel@visionarytalks.com?subject=AI%20watchlist%20nomination"
        method="post"
        encType="text/plain"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const name = String(data.get("person") || "").trim();
          const body = `Person: ${name}\nOrganization: ${String(data.get("organization") || "").trim() || "Not provided"}\nPublic source: ${String(data.get("source") || "").trim() || "Not provided"}\n\nWhy their work deserves investigation:\n${String(data.get("reason") || "").trim()}`;
          window.location.href = `mailto:daniel@visionarytalks.com?subject=${encodeURIComponent(`AI watchlist nomination: ${name}`)}&body=${encodeURIComponent(body)}`;
        }}
      >
        <label>
          Person’s name
          <input
            name="person"
            required
            maxLength={120}
            placeholder="Who should we watch?"
            autoComplete="off"
          />
        </label>
        <label>
          Organization or project <span>(optional)</span>
          <input
            name="organization"
            maxLength={160}
            placeholder="Their company, lab or project"
          />
        </label>
        <label>
          A public source <span>(optional)</span>
          <input
            name="source"
            type="url"
            maxLength={1000}
            placeholder="https://, a paper, project or profile"
          />
        </label>
        <label>
          Why should I investigate their work?
          <textarea
            name="reason"
            required
            rows={3}
            maxLength={2000}
            placeholder="A specific contribution, overlooked result or question worth testing…"
          />
        </label>
        <button type="submit">Nominate someone by email ↗</button>
        <small>
          Opens your email app. Send the draft there to complete your
          nomination. You can also email{" "}
          <a href="mailto:daniel@visionarytalks.com">
            daniel@visionarytalks.com
          </a>{" "}
          directly.
        </small>
      </form>
    </section>
  );
}
