import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  indexNowKey,
  indexNowPayload,
  indexNowURLs,
  submitIndexNow,
} from "../src/lib/indexnow";

const prod = { APP_ENV: "production", VERCEL_ENV: "production" };
const quiet = { info() {}, warn() {} };

test("the IndexNow key file is deployed with the site", () => {
  assert.equal(
    readFileSync(`public/${indexNowKey}.txt`, "utf8").trim(),
    indexNowKey,
  );
  assert.deepEqual(indexNowPayload(["https://visionarytalks.com/a/"]), {
    host: "visionarytalks.com",
    key: indexNowKey,
    keyLocation: `https://visionarytalks.com/${indexNowKey}.txt`,
    urlList: ["https://visionarytalks.com/a/"],
  });
});

test("only published, indexable saves produce URLs", () => {
  const published = { path: "/bob-iger-net-worth/", _status: "published" };
  assert.deepEqual(indexNowURLs(published, {}), [
    "https://visionarytalks.com/bob-iger-net-worth/",
  ]);
  assert.deepEqual(indexNowURLs({ ...published, _status: "draft" }, published), []);
  assert.deepEqual(
    indexNowURLs({ ...published, seo: { noindex: true } }, published),
    [],
  );
  assert.deepEqual(
    indexNowURLs({ ...published, path: "/new-path/" }, published).sort(),
    [
      "https://visionarytalks.com/bob-iger-net-worth/",
      "https://visionarytalks.com/new-path/",
    ],
  );
  assert.deepEqual(indexNowURLs({ ...published, path: "//evil.com/" }), []);
});

test("submits only from production and never throws", async () => {
  const calls: RequestInit[] = [];
  const fetcher = (async (_url: string, init: RequestInit) => {
    calls.push(init);
    return new Response(null, { status: 202 });
  }) as unknown as typeof fetch;
  const url = "https://visionarytalks.com/x/";
  assert.equal(
    await submitIndexNow([url], {
      env: { APP_ENV: "preview", VERCEL_ENV: "preview" },
      fetcher,
      log: quiet,
    }),
    undefined,
  );
  assert.equal(
    await submitIndexNow([url], { env: { ...prod, INDEXNOW_DISABLED: "1" }, fetcher, log: quiet }),
    undefined,
  );
  assert.equal(
    await submitIndexNow(["https://example.com/x/"], { env: prod, fetcher, log: quiet }),
    undefined,
  );
  assert.equal(calls.length, 0);
  assert.equal(await submitIndexNow([url, url], { env: prod, fetcher, log: quiet }), 202);
  assert.deepEqual(JSON.parse(String(calls[0].body)).urlList, [url]);
  const failing = (async () => {
    throw new Error("offline");
  }) as unknown as typeof fetch;
  assert.equal(await submitIndexNow([url], { env: prod, fetcher: failing, log: quiet }), undefined);
});
