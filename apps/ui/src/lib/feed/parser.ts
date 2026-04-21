import { extract, type FeedData, type FeedEntry } from "@extractus/feed-extractor";
import DOMPurify from "dompurify";

type FeedExtras = {
  image?: string;
  owner?: string;
  author?: string;
  categories: string[];
};

type EntryExtras = {
  url?: string;
  type?: string;
  length?: string;
  duration?: string;
  image?: string;
};

export type Feed = FeedData & { id: string; text: string } & FeedExtras;
export type Entry = FeedEntry & EntryExtras;

const PURIFY_OPTS = {
  ALLOWED_TAGS: ["p", "a"],
  ALLOWED_ATTR: ["href"],
};

export function sanitiseDescription(raw: string): { html: string; text: string } {
  const html = DOMPurify.sanitize(raw, PURIFY_OPTS);
  const text = DOMPurify.sanitize(raw, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  return { html, text };
}

type RawFeedData = {
  "itunes:image"?: { href?: string };
  image?: { url?: string };
  "itunes:author"?: string;
  "itunes:category"?: { "@_text"?: string } | { "@_text"?: string }[];
  "itunes:owner"?: { "itunes:name"?: string };
};

type RawEntryData = {
  enclosure?: { "@_url"?: string; "@_type"?: string; "@_length"?: string };
  "itunes:duration"?: string;
  "itunes:image"?: {
    "@_href"?: string;
  };
};

const xmlParserOptions = {
  processEntities: { maxTotalExpansions: Infinity },
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
};

export async function parseFeed(rssUrl: string): Promise<Feed> {
  const result = await extract(rssUrl, {
    xmlParserOptions,
    getExtraFeedFields(feedData: RawFeedData) {
      const image = feedData["itunes:image"]?.href ?? feedData.image?.url;
      const author = feedData["itunes:author"];
      const owner = feedData["itunes:owner"]?.["itunes:name"];
      const raw = feedData["itunes:category"];
      const rawArr = raw == null ? [] : Array.isArray(raw) ? raw : [raw];
      const categories = rawArr.map((c) => c["@_text"]).filter((t): t is string => t != null);

      return { image, owner, author, categories } satisfies FeedExtras;
    },
    getExtraEntryFields(entryData: RawEntryData) {
      const { enclosure, "itunes:duration": duration, "itunes:image": image } = entryData;

      return {
        url: enclosure?.["@_url"],
        type: enclosure?.["@_type"],
        length: enclosure?.["@_length"],
        image: image?.["@_href"],
        duration,
      } satisfies EntryExtras;
    },
  });

  return result as Feed;
}
