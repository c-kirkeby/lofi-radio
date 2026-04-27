import {
  BasicIndex,
  createCollection,
  type ParsedOrderBy,
  type SimpleComparison,
} from "@tanstack/svelte-db";
import { queryCollectionOptions, parseLoadSubsetOptions } from "@tanstack/query-db-collection";
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
  id: v.string(),
  text: v.string(),
  xmlUrl: v.string(),
  type: v.optional(v.string()),
});

export type PodcastInput = v.InferInput<typeof PodcastSchema>;

export const podcastsCollection = createCollection(
  persistedCollectionOptions<PodcastInput, string>({
    id: "podcasts",
    persistence,
    getKey: (podcast) => podcast.id,
    schemaVersion: 1,
  }),
);

const EpisodeSchema = v.object({
  podcastId: v.string(),
  link: v.optional(v.string()),
  url: v.string(),
  title: v.optional(v.string()),
  type: v.optional(v.string()),
  length: v.optional(v.number()),
  duration: v.optional(v.number()),
  image: v.optional(v.string()),
  published: v.optional(v.string()),
  description: v.optional(v.string()),
});

export type EpisodeInput = v.InferInput<typeof EpisodeSchema>;

export const episodesCollection = createCollection(
  persistedCollectionOptions<EpisodeInput, string>({
    id: "episodes",
    persistence,
    defaultIndexType: BasicIndex,
    autoIndex: 'eager',
    getKey: (episode) => episode.url,
    schemaVersion: 1,
  }),
);

episodesCollection.createIndex((row) => row.podcastId);

const PodcastMetaSchema = v.object({
  podcastId: v.string(),
  link: v.optional(v.string()),
  title: v.optional(v.string()),
  description: v.optional(v.string()),
  generator: v.optional(v.string()),
  language: v.optional(v.string()),
  published: v.optional(v.string()),
  image: v.optional(v.string()),
  owner: v.optional(v.string()),
  author: v.optional(v.string()),
  categories: v.optional(v.array(v.string())),
});

export type PodcastMetaInput = v.InferInput<typeof PodcastMetaSchema>;

export const podcastsMetaCollection = createCollection(
  persistedCollectionOptions<PodcastMetaInput, string>({
    id: "podcasts-meta",
    persistence,
    defaultIndexType: BasicIndex,
    autoIndex: 'eager',
    schemaVersion: 1,
    ...queryCollectionOptions({
      queryKey: ["podcasts-meta"],
      queryClient,
      staleTime: 12 * 60 * 60 * 1000, // 12 hours
      syncMode: "on-demand",
      autoIndex: "eager",
      defaultIndexType: BasicIndex,
      getKey: (podcastMeta) => podcastMeta.podcastId,
      queryFn: async (ctx) => {
        const params = parseLoadSubsetOptions(ctx.meta?.loadSubsetOptions);
        return getPodcastMeta(params);
      },
    }),
  }),
);

async function getPodcastMeta(params: {
  filters: Array<SimpleComparison>;
  sorts: Array<ParsedOrderBy>;
  limit?: number;
}): Promise<PodcastMetaInput[]> {
  const { filters } = params;

  let pairs: { podcastId: string; url: string }[] = [];

  filters.forEach(({ field, operator, value }) => {
    if (field.includes("podcastId") && operator === "in" && Array.isArray(value)) {
      value.forEach((podcastId) => {
        const podcast = podcastsCollection.get(podcastId);
        if (podcast?.xmlUrl) {
          pairs.push({ podcastId, url: podcast.xmlUrl });
        }
      });
    }
  });

  const results = await Promise.all(
    pairs.map(async ({ podcastId, url }) => {
      try {

        const feed = await parseFeedUrl(url);
        if (feed.image) {
          const image = await resizeImage(feed.image);
          await cacheImage(image, podcastId, "images");
        }
        const { entries, ...meta } = feed;

        if (entries?.length) {
          const episodes: EpisodeInput[] = entries
            .filter((entry): entry is typeof entry & { url: string } => !!entry.url && !episodesCollection.has(entry.url))
            .filter((entry, index, self) => index === self.findIndex(e => e.url === entry.url)) // Remove duplicates
            .map((entry) => ({
              podcastId,
              link: entry.link,
              url: entry.url,
              title: entry.title,
              type: entry.type,
              length: entry.length,
              duration: entry.duration,
              image: entry.image,
              published: entry.published,
              description: entry.description,
            }))

          episodesCollection.insert(episodes);
        }

        return {
          podcastId,
          ...feed,
        };
      } catch (error) {
        console.error(`Failed to fetch or parse feed for podcast ${podcastId}:`, error);
        return null;
      }
    }),
  );

  return results.filter((result) => result !== null);
}
podcastsMetaCollection.createIndex((row) => row.podcastId);
