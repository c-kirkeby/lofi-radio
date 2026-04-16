import { query } from "$app/server";
import { extract } from "@extractus/feed-extractor";
import type { FeedData, FeedEntry } from "@extractus/feed-extractor";

export interface FeedResult extends FeedData {
  image?: string;
}

/** Extended entry type with fields extracted via getExtraEntryFields */
export interface FeedEntryExtended extends FeedEntry {
  /** Raw enclosure object from the RSS feed (fast-xml-parser attribute format) */
  enclosure?: { "@_url"?: string; url?: string; "@_type"?: string; "@_length"?: string };
  /**
   * Episode duration. When freshly fetched, a raw itunes:duration string
   * ("H:MM:SS", "MM:SS", or total-seconds string). When loaded from cache,
   * feed-extractor may have normalised this to a number (total seconds).
   */
  duration?: string | number;
}

/**
 * Server-side remote query that fetches and parses an RSS feed URL.
 * Running on the server avoids CORS restrictions that prevent direct
 * browser fetches of third-party RSS feeds.
 *
 * Returns null if the feed cannot be fetched or parsed.
 */
export const getFeed = query("unchecked", async (xmlUrl: string): Promise<FeedResult | null> => {
  try {
    const data = await extract(xmlUrl, {
      // fast-xml-parser defaults to 1000 entity expansions, which is too low for
      // feeds with many HTML entities in episode descriptions (e.g. Critical Role).
      // Passing Infinity disables the limit.
      xmlParserOptions: { processEntities: { maxTotalExpansions: Infinity } },
      getExtraFeedFields(feedData: object) {
        const fd = feedData as Record<string, unknown>;
        const itunes = fd["itunes:image"] as Record<string, unknown> | undefined;
        const rssImage = fd["image"] as Record<string, unknown> | undefined;

        const image: string | undefined =
          (itunes?.["@_href"] as string | undefined) ??
          (rssImage?.["url"] as string | undefined) ??
          undefined;

        return image ? { image } : {};
      },
      getExtraEntryFields(entryData: object) {
        const ed = entryData as Record<string, unknown>;
        const enclosure = ed["enclosure"] as Record<string, unknown> | undefined;
        const itunesDuration = ed["itunes:duration"] as string | undefined;

        return {
          ...(enclosure ? { enclosure } : {}),
          ...(itunesDuration ? { duration: itunesDuration } : {}),
        };
      },
    });

    return data as FeedResult;
  } catch {
    return null;
  }
});
