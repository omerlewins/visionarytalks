"use client";

import { useState } from "react";

export function CompanySuggestion() {
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [question, setQuestion] = useState("");
  return (
    <section
      className="company-suggestion"
      id="suggest-company"
      aria-labelledby="suggest-company-title"
    >
      <div>
        <span className="eyebrow">YOUR QUESTION. OUR NEXT INVESTIGATION.</span>
        <h2 id="suggest-company-title">
          Who should we
          <br />
          <em>look into next?</em>
        </h2>
        <p>
          A brand you use. An AI company you follow. A business whose ownership
          doesn’t add up. Tell Daniel what you want to understand.
        </p>
        <p className="suggestion-note">
          Suggestions go to{" "}
          <a href="mailto:daniel@visionarytalks.com">
            daniel@visionarytalks.com
          </a>
          . We review ideas for future reporting; coverage is not guaranteed.
        </p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const subject = `Company investigation suggestion: ${company.trim()}`;
          const body = `Company: ${company.trim()}\nWebsite: ${website.trim() || "Not provided"}\n\nWhat I would like investigated:\n${question.trim() || "Who owns this company, and who controls it?"}`;
          window.location.href = `mailto:daniel@visionarytalks.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        }}
      >
        <label>
          Company or brand
          <input
            name="company"
            required
            maxLength={120}
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Which company are you curious about?"
            autoComplete="organization"
          />
        </label>
        <label>
          Company website <span>(optional)</span>
          <input
            name="website"
            type="url"
            maxLength={500}
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://"
          />
        </label>
        <label>
          What should we investigate? <span>(optional)</span>
          <textarea
            name="question"
            rows={3}
            maxLength={2000}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="The ownership, investors, a recent deal…"
          />
        </label>
        <button type="submit">Send your idea by email ↗</button>
        <small>
          Opens your email app with your suggestion. Send it there to complete
          the submission.
        </small>
      </form>
    </section>
  );
}
