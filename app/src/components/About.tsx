import React from "react";
import profile from "@/data/publication-profile.json";

export function About({
  illustrationSrc = "/reference/daniel-mercer-editorial-v1.png",
  linkPrefix = "",
}: {
  illustrationSrc?: string;
  linkPrefix?: string;
}) {
  return (
    <article className="vt-about">
      <header className="vt-about-hero">
        <div className="vt-about-opening">
          <span className="eyebrow">ABOUT VISIONARY TALKS</span>
          <h1>
            Follow the money.
            <br />
            <em>
              Understand
              <br />
              what’s next.
            </em>
          </h1>
          <p className="vt-about-dek">
            I investigate the companies, capital and career shifts shaping the
            next economy.
          </p>
          <div className="vt-about-signature">
            <span>Daniel Mercer</span>
            <a href={"mailto:" + profile.email}>{profile.email} ↗</a>
          </div>
        </div>
        <figure className="vt-about-portrait">
          <img
            src={illustrationSrc}
            alt="Editorial illustration of an anonymous researcher reading at a desk"
            width={1024}
            height={1536}
          />
          <figcaption>{profile.illustrationCaption}</figcaption>
        </figure>
      </header>
      <dl className="vt-about-facts">
        <div>
          <dt>EXPERIENCE</dt>
          <dd>7 years in finance</dd>
        </div>
        <div>
          <dt>EDUCATION</dt>
          <dd>Master’s in economics</dd>
        </div>
        <div>
          <dt>BACKGROUND</dt>
          <dd>Major firms &amp; consulting</dd>
        </div>
      </dl>
      <div className="vt-about-reading">
        <aside className="vt-about-index">
          <span className="eyebrow">THE PUBLICATION</span>
          <nav aria-label="About this publication">
            <a href="#about-me">The person behind it</a>
            <a href="#why-a-pen-name">Why a pen name</a>
            <a href="#research">How I research</a>
            <a href="#contact">Contact &amp; corrections</a>
          </nav>
        </aside>
        <div className="vt-about-body">
          <section id="about-me">
            <span className="eyebrow">01 / THE PERSON</span>
            <h2>
              A working research notebook
              <br />
              for a changing world.
            </h2>
            <p>{profile.about}</p>
            <p>{profile.interest}</p>
            <p>{profile.purpose}</p>
          </section>
          <section id="why-a-pen-name" className="vt-about-privacy">
            <span className="eyebrow">02 / A NOTE ON MY NAME</span>
            <h2>
              A pen name.
              <br />A clear point of contact.
            </h2>
            <p>{profile.privacy}</p>
            <p>
              I share my background, explain my research methods and provide a
              direct contact for questions and corrections.
            </p>
          </section>
          <section id="research">
            <span className="eyebrow">03 / THE RESEARCH</span>
            <h2>
              Every useful finding
              <br />
              starts with a better question.
            </h2>
            <p>
              I want this publication to be useful enough to return to: clear
              answers, distinctive evidence and financial numbers you can
              understand.
            </p>
            <ol className="vt-about-methods">
              {profile.research.map((method, i) => (
                <li key={method.title}>
                  <span aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3>{method.title}</h3>
                    <p>{method.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="vt-about-note">
              My research uses public records. A source check establishes what a
              document reports; it does not independently audit a private
              company or disclose someone’s complete personal balance sheet.
            </p>
          </section>
        </div>
      </div>
      <section className="vt-about-coverage" aria-labelledby="coverage-title">
        <div className="vt-about-coverage-title">
          <span className="eyebrow">WHAT I FOLLOW</span>
          <h2 id="coverage-title">
            The business.
            <br />
            The people. The money.
          </h2>
        </div>
        <div className="vt-about-topics">
          {[
            ["Ownership", "Who controls the company?", "/category/ownership/"],
            ["Money", "What do the numbers reveal?", "/category/business/"],
            ["Careers", "Where is work heading?", "/category/careers/"],
            [
              "Leaders",
              "Who is building what comes next?",
              "/category/people/",
            ],
          ].map(([title, question, href]) => (
            <a key={title} href={linkPrefix + href}>
              <h3>
                {title} <span aria-hidden="true">↗</span>
              </h3>
              <p>{question}</p>
            </a>
          ))}
        </div>
      </section>
      <section id="contact" className="vt-about-contact">
        <div>
          <span className="eyebrow">04 / KEEP THE CONVERSATION OPEN</span>
          <h2>
            Have a question?
            <br />
            <em>Bring the evidence.</em>
          </h2>
          <a className="vt-about-email" href={"mailto:" + profile.email}>
            {profile.email} ↗
          </a>
        </div>
        <div>
          <a
            className="vt-about-linkedin"
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
          >
            Follow Visionary Talks on LinkedIn ↗
          </a>
          <h3>Corrections, questions &amp; research leads</h3>
          <p>{profile.corrections}</p>
          <p>
            I also welcome company records, thoughtful challenges and
            suggestions for what I should investigate next.
          </p>
        </div>
      </section>
    </article>
  );
}
