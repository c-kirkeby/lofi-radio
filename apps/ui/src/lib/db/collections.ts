import { BasicIndex, createCollection, type SimpleComparison } from "@tanstack/svelte-db";
import {
  queryCollectionOptions,
  parseLoadSubsetOptions,
  parseWhereExpression,
} from "@tanstack/query-db-collection";
import {
  createBrowserWASQLitePersistence,
  persistedCollectionOptions,
  openBrowserWASQLiteOPFSDatabase,
  BrowserCollectionCoordinator,
} from "@tanstack/browser-db-sqlite-persistence";
import { QueryClient } from "@tanstack/query-core";
import * as v from "valibot";
import { parseFeedUrl } from "@/feed/parser";
import { cacheImage, resizeImage } from "@/caches/image";
import { podcastIndexClient } from "@/providers/podcast-index";

const queryClient = new QueryClient();

const database = await openBrowserWASQLiteOPFSDatabase({
  databaseName: "lofi-radio.sqlite",
});

const coordinator = new BrowserCollectionCoordinator({
  dbName: "lofi-radio",
});

const persistence = createBrowserWASQLitePersistence({
  database,
  coordinator,
});

const PodcastSchema = v.object({
  feedId: v.number(),
  podcastGuid: v.string(),
  subscribed: v.boolean(),
  xmlUrl: v.string(),
  title: v.string(),
  author: v.string(),
  description: v.string(),
  image: v.string(),
  link: v.string(),
  language: v.optional(v.string()),
  categories: v.optional(v.array(v.string())),
});

export type PodcastInput = v.InferInput<typeof PodcastSchema>;

function feedFromPIFeed(feed: {
  id: number;
  podcastGuid: string;
  url: string;
  title: string;
  author?: string | null;
  description?: string | null;
  artwork?: string | null;
  image?: string | null;
  link?: string | null;
  language?: string;
  categories?: Record<string, string>;
}): PodcastInput {
  return {
    feedId: feed.id,
    podcastGuid: feed.podcastGuid,
    subscribed: false,
    xmlUrl: feed.url,
    title: feed.title,
    author: feed.author ?? "",
    description: feed.description ?? "",
    image: feed.artwork || feed.image || "",
    link: feed.link ?? "",
    language: feed.language || undefined,
    categories: feed.categories ? Object.values(feed.categories) : undefined,
  };
}

export const podcastsCollection = createCollection(
  persistedCollectionOptions<PodcastInput, number>({
    id: "podcasts",
    persistence,
    schemaVersion: 1,
    defaultIndexType: BasicIndex,
    autoIndex: "eager",
    ...queryCollectionOptions({
      queryKey: (opts) => {
        if (opts.where) {
          return ["podcasts", JSON.stringify(opts.where)];
        }
        return ["podcasts"];
      },
      onInsert: async ({ transaction }) => {
        for (const mutation of transaction.mutations) {
          const podcast = mutation.modified as PodcastInput;
          if (podcast.subscribed && podcast.image) {
            try {
              const image = await resizeImage(podcast.image);
              await cacheImage(image, String(podcast.feedId), "image");
            } catch {
              // best-effort
            }
          }
        }
      },
      onUpdate: async ({ transaction }) => {
        for (const mutation of transaction.mutations) {
          const podcast = mutation.modified as PodcastInput;
          if (podcast.subscribed && podcast.image) {
            try {
              const image = await resizeImage(podcast.image);
              await cacheImage(image, String(podcast.feedId), "image");
            } catch {
              // best-effort
            }
          }
        }
      },
      onDelete: async () => {},
      queryClient,
      syncMode: "on-demand",
      getKey: (podcast) => podcast.feedId,
      queryFn: async (ctx) => {
        const where = ctx.meta?.loadSubsetOptions?.where;
        return getPodcasts(where);
      },
    }),
  }),
);

type WhereClause = { feedId?: number; searchTerm?: string };

function extractPodcastFilters(where: unknown): WhereClause {
  const result: WhereClause = {};

  parseWhereExpression(where as Parameters<typeof parseWhereExpression>[0], {
    handlers: {
      eq: (field: string[], value: unknown) => {
        if (field.join(".").includes("feedId") && typeof value === "number") {
          result.feedId = value;
        }
        return null;
      },
      ilike: (field: string[], value: unknown) => {
        if (field.join(".").includes("title") && typeof value === "string") {
          result.searchTerm = value.replace(/^%|%$/g, "");
        }
        return null;
      },
      and: (..._args: unknown[]) => null,
      or: (..._args: unknown[]) => null,
    },
    onUnknownOperator: () => null,
  });

  return result;
}

async function getPodcasts(where: unknown): Promise<PodcastInput[]> {
  const { feedId, searchTerm } = extractPodcastFilters(where);

  if (feedId !== undefined) {
    const existing = podcastsCollection.get(feedId);
    if (existing) return [{ ...existing }];
    const { data, error } = await podcastIndexClient("podcasts/byfeedid", {
      query: { id: feedId },
    });
    if (error || !data || data.status !== "true") return [];
    const podcast = feedFromPIFeed(data.feed);
    return [podcast];
  }

  if (searchTerm) {
    const { data, error } = await podcastIndexClient("/search/byterm", {
      query: { q: searchTerm },
    });
    if (error || !data || data.status !== "true") return [];
    return data.feeds.map((f) => {
      const podcast = feedFromPIFeed(f);
      podcast.subscribed = podcastsCollection.get(f.id)?.subscribed ?? false;
      return podcast;
    });
  }

  return [...podcastsCollection.entries()].map(([, podcast]) => ({ ...podcast }));
}

const EpisodeSchema = v.object({
  feedId: v.number(),
  link: v.optional(v.string()),
  url: v.string(),
  title: v.optional(v.string()),
  type: v.optional(v.string()),
  length: v.optional(v.number()),
  duration: v.optional(v.number()),
  image: v.optional(v.string()),
  published: v.optional(v.date()),
  description: v.optional(v.string()),
});

export type EpisodeInput = v.InferInput<typeof EpisodeSchema>;

export const episodesCollection = createCollection(
  persistedCollectionOptions<EpisodeInput, string>({
    id: "episodes",
    persistence,
    schemaVersion: 1,
    defaultIndexType: BasicIndex,
    autoIndex: "eager",
    ...queryCollectionOptions({
      queryKey: (opts) => {
        if (opts.where) {
          return ["episodes", JSON.stringify(opts.where)];
        }
        return ["episodes"];
      },
      queryClient,
      syncMode: "on-demand",
      staleTime: 12 * 60 * 60 * 1000, // 12 hours
      getKey: (episode) => episode.url,
      queryFn: async (ctx) => {
        const { filters } = parseLoadSubsetOptions(ctx.meta?.loadSubsetOptions);
        return getEpisodes(filters);
      },
    }),
  }),
);

episodesCollection.createIndex((row) => row.feedId);

async function getEpisodes(filters: Array<SimpleComparison>): Promise<EpisodeInput[]> {
  const pairs: { feedId: number; url: string }[] = [];

  for (const { field, operator, value } of filters) {
    const fieldName = Array.isArray(field) ? field.join(".") : field;

    if (fieldName.includes("feedId") && operator === "in" && Array.isArray(value)) {
      for (const feedId of value) {
        const podcast = podcastsCollection.get(feedId);
        if (podcast?.xmlUrl) pairs.push({ feedId, url: podcast.xmlUrl });
      }
    } else if (fieldName.includes("feedId") && operator === "eq" && typeof value === "number") {
      const podcast = podcastsCollection.get(value);
      if (podcast?.xmlUrl) pairs.push({ feedId: value, url: podcast.xmlUrl });
    }
  }

  const results = await Promise.all(
    pairs.map(async ({ feedId, url }) => {
      try {
        const feed = await parseFeedUrl(url);
        if (feed.image) {
          const image = await resizeImage(feed.image);
          await cacheImage(image, String(feedId), "image");
        }
        const { entries } = feed;
        if (!entries?.length) return [];

        const episodes: EpisodeInput[] = entries
          .filter((entry): entry is typeof entry & { url: string } => !!entry.url)
          .filter((entry, index, self) => index === self.findIndex((e) => e.url === entry.url))
          .sort((a, b) => (b.published?.getTime() ?? 0) - (a.published?.getTime() ?? 0))
          .map((entry) => ({
            feedId,
            link: entry.link,
            url: entry.url,
            title: entry.title,
            type: entry.type,
            length: entry.length,
            duration: entry.duration,
            image: entry.image,
            published: entry.published,
            description: entry.description,
          }));

        return episodes;
      } catch (error) {
        console.error(`Failed to fetch or parse feed for feedId ${feedId}:`, error);
        return [];
      }
    }),
  );

  return results.flat();
}

const ProgressSchema = v.object({
  url: v.string(),
  feedId: v.number(),
  position: v.number(),
  duration: v.number(),
  played: v.boolean(),
  updatedAt: v.date(),
});

export type ProgressInput = v.InferInput<typeof ProgressSchema>;

export const progressCollection = createCollection(
  persistedCollectionOptions<ProgressInput, string>({
    id: "progress",
    persistence,
    schemaVersion: 1,
    defaultIndexType: BasicIndex,
    autoIndex: "eager",
    getKey: (progress) => progress.url,
  }),
);

const QueueSchema = v.object({
  /** Episode audio URL — primary key, matches EpisodeInput.url */
  url: v.string(),
  /** Podcast feed ID — needed to look up podcast title/image for queue page */
  feedId: v.number(),
  /**
   * Integer sort order (0-based, gapless).
   * Kept as an explicit field to support future drag-to-reorder without
   * requiring a schema migration — just update the `order` values.
   */
  order: v.number(),
  /** When the episode was added to the queue */
  addedAt: v.date(),
});

export type QueueInput = v.InferInput<typeof QueueSchema>;

export const queueCollection = createCollection(
  persistedCollectionOptions<QueueInput, string>({
    id: "queue",
    persistence,
    schemaVersion: 1,
    defaultIndexType: BasicIndex,
    autoIndex: "eager",
    getKey: (item) => item.url,
  }),
);

/** Returns all queue items sorted by `order` ascending. */
export function getQueueOrdered(): QueueInput[] {
  return [...queueCollection.entries()].map(([, q]) => q).sort((a, b) => a.order - b.order);
}

/** Add an episode to the front of the queue (play next). */
export function enqueueNext(url: string, feedId: number): void {
  // Shift all existing items up by 1
  for (const [key, item] of queueCollection.entries()) {
    queueCollection.update(key, (draft: QueueInput) => {
      draft.order = item.order + 1;
    });
  }
  queueCollection.insert({ url, feedId, order: 0, addedAt: new Date() });
}

/** Add an episode to the back of the queue (play last). */
export function enqueueLast(url: string, feedId: number): void {
  const items = getQueueOrdered();
  const nextOrder = items.length > 0 ? (items[items.length - 1]?.order ?? -1) + 1 : 0;
  queueCollection.insert({ url, feedId, order: nextOrder, addedAt: new Date() });
}

/** Remove an episode from the queue and compact the order values. */
export function dequeue(url: string): void {
  const item = queueCollection.get(url);
  if (!item) return;
  const removedOrder = item.order;
  queueCollection.delete(url);
  // Compact: shift items after the removed one down by 1
  for (const [key, q] of queueCollection.entries()) {
    if (q.order > removedOrder) {
      queueCollection.update(key, (draft: QueueInput) => {
        draft.order = q.order - 1;
      });
    }
  }
}

/**
 * Reorder a queue item to a new position.
 * Stub for future drag-to-reorder — not called from UI yet.
 */
export function reorderQueue(url: string, newOrder: number): void {
  const item = queueCollection.get(url);
  if (!item) return;
  const oldOrder = item.order;
  if (oldOrder === newOrder) return;

  for (const [key, q] of queueCollection.entries()) {
    if (q.url === url) continue;
    if (oldOrder < newOrder && q.order > oldOrder && q.order <= newOrder) {
      queueCollection.update(key, (draft: QueueInput) => {
        draft.order = q.order - 1;
      });
    } else if (oldOrder > newOrder && q.order >= newOrder && q.order < oldOrder) {
      queueCollection.update(key, (draft: QueueInput) => {
        draft.order = q.order + 1;
      });
    }
  }
  queueCollection.update(url, (draft: QueueInput) => {
    draft.order = newOrder;
  });
}
