export const metadata = {
  title: "Newsletter privacy notice",
  alternates: { canonical: "/newsletter-privacy/" },
};
export default function Page() {
  return (
    <article className="publication-policy">
      <span className="eyebrow">NEWSLETTER / UPDATED OCTOBER 12, 2026</span>
      <h1>Your newsletter registration.</h1>
      <p>
        When you register, Visionary Talks stores your email address, the time
        and version of your consent, registration status and the page from which
        you registered. This information is held in our private CMS database,
        accessible to authorised publication staff. Hosting and database
        infrastructure process it on our behalf.
      </p>
      <h2>What happens now</h2>
      <p>
        Registration records your interest in receiving the Visionary Brief.
        Newsletter email delivery has not started. This form does not send a
        welcome message or verify that you control the address. We do not sell
        newsletter registration data.
      </p>
      <h2>Withdraw consent or request deletion</h2>
      <p>
        You can request removal, withdraw consent or ask about your registration
        by emailing{" "}
        <a href="mailto:daniel@visionarytalks.com">daniel@visionarytalks.com</a>{" "}
        from the registered address. We retain registrations while preparing and
        operating the newsletter, unless you request deletion or the programme
        closes. Verification and unsubscribe handling must be connected before
        newsletter delivery is enabled.
      </p>
      <h2>Preventing misuse</h2>
      <p>
        We use a hidden spam field and short-lived request limits. Request
        limits use a keyed hash of the network address and a time window, rather
        than storing the raw address in the newsletter list. Hosting services
        may separately retain security logs. Registration requests are not sent
        to an AI service for processing.
      </p>
    </article>
  );
}
