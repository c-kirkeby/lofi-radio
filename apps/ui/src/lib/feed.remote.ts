import { query } from "$app/server";
import { parseFeed } from "./feed/parser";
import * as v from "valibot";

/**
 * Server-side remote query that fetches and parses an RSS feed URL.
 * Running on the server avoids CORS restrictions that prevent direct
 * browser fetches of third-party RSS feeds.
 */
export const getFeed = query(v.pipe(v.string(), v.url()), async (xmlUrl: string) => {
  return await parseFeed(xmlUrl);
});
