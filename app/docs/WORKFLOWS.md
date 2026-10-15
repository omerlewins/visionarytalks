# Editorial workflows

Use **Content inbox** in Payload to supply text, private documents, URLs, reference
images, workflow type, responsible author, image choice and intended path. Saving with
**Prepare** queues a persisted Payload task. No provider key is sent to the browser.
An existing target automatically captures its current version and path. Updates are
stored as proposed revisions rather than overwriting a human-edited article.

**Content jobs** tracks drafting, validation/upload, imagery and structured entity
stages. Successful checkpoints survive later failures. **Action → retry** resumes;
**Action → cancel** prevents subsequent checkpoints. A native exclusive concurrency
key serializes retries of the same job; a unique input checksum prevents repeat intake.
Draft records and asset checksums supply a second duplicate guard.

The built-in OpenAI adapter uses Responses background mode, persists response IDs,
and polls through the durable queue. An ambiguous submission is flagged for human
reconciliation rather than automatically submitting another paid generation. Stored
background responses have provider retention implications; configure the approved
project accordingly. Model names remain explicit environment settings. JSON output
is validated with the versioned Zod schema, including source-ID integrity, before CMS
creation. JSON mode is used because entity data permits extensible fields; validation
is mandatory, not delegated to the model.

The illustration stage includes the supplied monochrome portrait as a **style-only**
reference and requires separate identity references for leaders. It normalizes the
image through Sharp, deduplicates by checksum, saves it privately and records provider,
model, prompt version and reference IDs. An editor must approve attribution/likeness
before publication. Factual charts are SVG/HTML/data-driven, never generated imagery.

Structured outputs create separate draft people, companies, institutions, education,
company roles, ownership, event and observation records. Relationship references are
resolved only among known packet identities. Existing matches become proposals for
editorial resolution; they are not silently overwritten. Unknown facts stay null or
in the unresolved list. Sources require independent human approval before a record
can publish. A worker has no publication capability.

URLs are evidence inputs, not executable instructions. This server never fetches an
arbitrary intake URL. The OpenAI adapter enables provider web search only when the
editor explicitly enables research. An alternate HTTPS bridge must enforce safe
public-network fetching, no redirects to private networks, size/time limits and no
credential forwarding. Do not enable an unreviewed bridge.

## Alternate bridge contract

Draft POST: bearer authentication, idempotency key, prompt version, specialist
instructions and packet (private document bytes are base64). Return the object defined
by `src/workflows/contracts.ts`. Image POST: return base64, alt, provider and model;
the bridge must resolve approved reference IDs with a separately scoped access path.
The local acceptance test substitutes a synthetic bridge without making model calls.

## Editorial acceptance still required

- Four real owner-supplied packets, each reviewed through publication in staging.
- Live model access, private storage, duration and provider usage/spend limits.
- Likeness review and desktop/mobile crop approval; regenerate only the image stage.
- Confirm targeted revision UX, scheduling policy, retention and operational alerts.
- Add accounting for provider monetary costs after model/provider selection. Token
  usage is retained; this build does not claim to enforce a dollar budget.
- Test provider failure, long-running polling, source-document extraction quality,
  and conflict resolution with a concurrent human edit in the deployed environment.

References checked October 8, 2026:
- https://developers.openai.com/api/docs/guides/background
- https://developers.openai.com/api/docs/guides/structured-outputs
- https://developers.openai.com/api/docs/guides/tools-image-generation
- https://developers.openai.com/api/docs/guides/file-inputs
- https://payloadcms.com/docs/jobs-queue/overview
