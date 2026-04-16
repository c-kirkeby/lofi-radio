import { getFeed } from "$lib/feed.remote";
import type { FeedResult } from "$lib/feed.remote";
import { getCachedFeed, cacheFeed } from "$lib/db/feeds";
import type { CachedFeed } from "$lib/db/feeds";

export type { CachedFeed, FeedResult };

/**
 * Load feed data for a given show id and RSS URL.
 *
 * Resolution order:
 *  1. IndexedDB cache ("lofi" / "feeds"), keyed by show id
 *  2. Remote function (server-side fetch via @extractus/feed-extractor,
 *     avoiding browser CORS restrictions)
 *     - result is persisted to IndexedDB before returning
 *
 * Returns null if both the cache and the remote fetch fail.
 */
export async function fetchFeed(id: number, xmlUrl: string): Promise<CachedFeed | null> {
  // 1. Try IndexedDB cache first
  const cached = await getCachedFeed(id);
  if (cached) return cached;

  // 2. Fetch via server-side remote function (.run() returns a plain Promise,
  //    safe to call outside a reactive context such as onMount)
  const data = (await getFeed(xmlUrl).run()) as FeedResult | null;
  if (!data) return null;

  await cacheFeed(id, data);
  return { ...data, id };
}
