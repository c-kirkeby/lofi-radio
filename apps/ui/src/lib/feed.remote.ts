import { query } from "$app/server";
import { parseFeed } from "./feed/parser";

/**
 * Server-side remote query that fetches and parses an RSS feed URL.
 * Running on the server avoids CORS restrictions that prevent direct
 * browser fetches of third-party RSS feeds.
 */
export const getFeed = query("unchecked", async (xmlUrl: string) => {
  return await parseFeed(xmlUrl);
});
