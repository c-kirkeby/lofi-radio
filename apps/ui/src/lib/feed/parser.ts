import { parseRssFeed, type Rss } from "feedsmith";
import DOMPurify from "dompurify";

const PURIFY_OPTS = {
  ALLOWED_TAGS: ["p", "a"],
  ALLOWED_ATTR: ["href"],
};

export function sanitiseDescription(raw: string): { html: string; text: string } {
  const html = DOMPurify.sanitize(raw, PURIFY_OPTS);
  const text = DOMPurify.sanitize(raw, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  return { html, text };
}

export async function fetchFeed(rssUrl: string) {
  const response = await fetch(
    `${window.location.origin}/api/proxy?url=${encodeURIComponent(rssUrl)}`,
  );

  const xml = await response.text();

  return parseRssFeed(xml);
}

export type Entry = {
  id?: string;
  url?: string;
  title?: string;
  image?: string;
  published?: string;
  duration?: number;
  description?: string;
};

export function parseFeed(rss: Rss.Feed<string>) {
  const categories = (
    rss.categories?.map((category) => category.name) ??
    rss.itunes?.categories?.map((category) => category.text)
  )?.filter((category): category is string => typeof category === "string");
  return {
    link: rss.link,
    title: rss.title,
    description: rss.description,
    generator: rss.generator,
    language: rss.language,
    published: rss.pubDate,
    image: rss.itunes?.image ?? rss.image?.url,
    owner: rss.itunes?.owner?.name,
    author: rss.itunes?.author,
    categories,
    entries: rss.items?.map((item) => ({
      id: item.guid?.value,
      link: item.link,
      url: item.enclosures?.[0].url,
      title: item.title,
      type: item.enclosures?.[0].type,
      length: item.enclosures?.[0].length,
      duration: item.itunes?.duration,
      image: item.itunes?.image,
      published: item.pubDate,
      description: item.description,
    })),
  };
}

export async function parseFeedUrl(rssUrl: string) {
  const rss = await fetchFeed(rssUrl);
  return parseFeed(rss);
}
