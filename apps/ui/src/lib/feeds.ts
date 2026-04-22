import { getFeed } from "$lib/feed.remote";
import { getCachedFeed, cacheFeed } from "$lib/db/feeds";

/**
 * Parse an itunes:duration value into a human-readable string via Intl.DurationFormat.
 * Accepts "H:MM:SS", "MM:SS", total seconds as a string, or total seconds as a number.
 * Returns null if the value is absent or cannot be parsed.
 */
export function parseDuration(raw: string | number | undefined): string | null {
  if (raw === undefined || raw === null || raw === "") return null;
  let duration: string | number = raw;
  if (typeof raw === "number") {
    const hours = Math.floor(raw / 3600);
    const minutes = Math.floor((raw % 3600) / 60);
    const seconds = raw % 60;
    const options = { style: hours < 1 ? "long" : "narrow" };
    /** @ts-expect-error {@link https://github.com/microsoft/TypeScript/issues/60608} **/
    return new Intl.DurationFormat(window.navigator.language, options).format({
      hours,
      minutes,
      seconds: hours === 0 && minutes === 0 ? seconds : 0,
    });
  }
  const parts = (duration as string).split(":").map(Number);
  const [hours, minutes, seconds] = parts.length === 3 ? parts : [0, parts[0] ?? 0, parts[1] ?? 0];

  const options = { style: hours < 1 ? "long" : "narrow" };

  /** @ts-expect-error {@link https://github.com/microsoft/TypeScript/issues/60608} **/
  return new Intl.DurationFormat(window.navigator.language, options).format({
    hours,
    minutes,
    seconds: hours === 0 && minutes === 0 ? seconds : 0,
  });
}
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
export async function fetchFeed(id: number, xmlUrl: string) {
  // 1. Try IndexedDB cache first
  const cached = await getCachedFeed(id);
  if (cached) return cached;

  // 2. Fetch via server-side remote function (.run() returns a plain Promise,
  //    safe to call outside a reactive context such as onMount)
  const data = await getFeed(xmlUrl).run();
  if (!data) return null;

  await cacheFeed(id, data);
  return { ...data, id };
}
