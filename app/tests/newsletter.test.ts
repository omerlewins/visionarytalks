import { test } from "node:test";
import assert from "node:assert/strict";
import {
  newsletterInput,
  allowedNewsletterOrigin,
} from "../src/lib/newsletter";
import { newsletterRegistrations } from "../src/cms/newsletter";
test("newsletter registration requires genuine consent and a normalized email", () => {
  const p = newsletterInput.parse({
    email: " Reader@Example.COM ",
    consent: true,
    sourcePath: "/who-owns-groq/",
  });
  assert.equal(p.email, "reader@example.com");
  for (const bad of [
    { email: "bad", consent: true },
    { email: "reader@example.com", consent: false },
    {
      email: "reader@example.com",
      consent: true,
      sourcePath: "https://evil.example/",
    },
    {
      email: "reader@example.com",
      consent: true,
      sourcePath: "//evil.example",
    },
    { email: "reader@example.com", consent: true, status: "verified" },
  ])
    assert.equal(newsletterInput.safeParse(bad).success, false);
});
test("newsletter endpoint accepts only its own browser origin", () => {
  assert.equal(allowedNewsletterOrigin("http://127.0.0.1:3119","http://localhost:3119/api/newsletter","127.0.0.1:3119","http"),true);
  assert.equal(allowedNewsletterOrigin("https://preview.vercel.app","http://localhost:3000/api/newsletter","preview.vercel.app","https"),true);
  assert.equal(allowedNewsletterOrigin("https://evil.example","http://localhost:3000/api/newsletter","preview.vercel.app","https"),false);
  assert.equal(
    allowedNewsletterOrigin(
      "https://visionarytalks.com",
      "https://visionarytalks.com/api/newsletter",
    ),
    true,
  );
  assert.equal(
    allowedNewsletterOrigin(
      "https://evil.example",
      "https://visionarytalks.com/api/newsletter",
    ),
    false,
  );
  assert.equal(
    allowedNewsletterOrigin(null, "https://visionarytalks.com/api/newsletter"),
    false,
  );
});
test("newsletter addresses cannot be listed or edited by the public CMS API", async () => {
  for (const action of ["read", "create", "update", "delete"] as const) {
    const access = newsletterRegistrations.access![action];
    assert.equal(
      typeof access === "function"
        ? await access({ req: { user: null } } as any)
        : access,
      false,
    );
  }
});
