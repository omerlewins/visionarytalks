// IndexNow: tells Bing, Yandex, Seznam, Naver and other participating search
// engines that a URL was added, changed or removed. Google does not use
// IndexNow. The key file lives at public/<key>.txt and must stay deployed.
import { publicationURL, productionIndexing } from "./seo";

export const indexNowKey = "09b33715272ca7ead177b7808179578f";
export const indexNowEndpoint = "https://api.indexnow.org/indexnow";

type StoryLike = {
  path?: string | null;
  _status?: string | null;
  seo?: { noindex?: boolean | null } | null;
};

const publicURL = (doc?: StoryLike | null) =>
  doc?.path && doc.path.startsWith("/") && !doc.path.startsWith("//")
    ? new URL(doc.path, publicationURL).href
    : undefined;
const isPublic = (doc?: StoryLike | null) =>
  doc?._status === "published" && !doc.seo?.noindex;

// URLs to submit after a save: a published (or republished) page, plus its
// old address when a published page moved. Draft and autosave writes submit
// nothing. Payload hooks cannot tell an autosave of a published story from an
// unpublish (both arrive as a draft), so unpublishing is left to the
// unpublish script, which submits the removed URL itself.
export function indexNowURLs(
  doc: StoryLike,
  previousDoc?: StoryLike | null,
): string[] {
  if (!isPublic(doc)) return [];
  const urls = new Set<string>();
  const now = publicURL(doc);
  const before = publicURL(previousDoc);
  if (now) urls.add(now);
  if (isPublic(previousDoc) && before) urls.add(before);
  return [...urls];
}

export function indexNowPayload(urls: string[]) {
  const { host } = new URL(publicationURL);
  return {
    host,
    key: indexNowKey,
    keyLocation: `${publicationURL}/${indexNowKey}.txt`,
    urlList: urls,
  };
}

// Submits only from the real production site. Never throws: a search engine
// being unavailable must not block a publish or a build.
export async function submitIndexNow(
  urls: string[],
  {
    env = process.env,
    fetcher = fetch,
    log = console,
  }: {
    env?: Record<string, string | undefined>;
    fetcher?: typeof fetch;
    log?: Pick<Console, "info" | "warn">;
  } = {},
): Promise<number | undefined> {
  const list = [...new Set(urls)].filter((url) =>
    url.startsWith(publicationURL + "/"),
  );
  if (!list.length || !productionIndexing(env) || env.INDEXNOW_DISABLED === "1")
    return undefined;
  try {
    const response = await fetcher(indexNowEndpoint, {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify(indexNowPayload(list)),
      signal: AbortSignal.timeout(8000),
    });
    (response.ok ? log.info : log.warn)(
      `IndexNow ${response.status} for ${list.length} URL(s): ${list.join(" ")}`,
    );
    return response.status;
  } catch (error) {
    log.warn(`IndexNow submission failed: ${String(error)}`);
    return undefined;
  }
}
