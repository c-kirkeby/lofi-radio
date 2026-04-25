import { createCollection } from "@tanstack/svelte-db";
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

const EntrySchema = v.object({
  id: v.optional(v.string()),
  link: v.optional(v.string()),
  url: v.optional(v.string()),
  title: v.optional(v.string()),
  type: v.optional(v.string()),
  length: v.optional(v.number()),
  duration: v.optional(v.number()),
  image: v.optional(v.string()),
  published: v.optional(v.string()),
  description: v.optional(v.string()),
});

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
  entries: v.optional(v.array(EntrySchema)),
});

export type PodcastMetaInput = v.InferInput<typeof PodcastMetaSchema>;

export const podcastsMetaCollection = createCollection(
  persistedCollectionOptions<PodcastMetaInput, string>({
    id: "podcasts-meta",
    persistence,
    schemaVersion: 1,
    ...queryCollectionOptions({
      queryKey: ["podcasts-meta"],
      queryClient,
      staleTime: 12 * 60 * 60 * 1000, // 12 hours
      syncMode: "on-demand",
      getKey: (podcastMeta) => podcastMeta.podcastId,
      queryFn: async (ctx) => {
        const { limit, where, orderBy } = ctx.meta?.loadSubsetOptions ?? {};
        const { filters } = parseLoadSubsetOptions({ where, orderBy, limit });

        const podcastIdFilter = filters.find(
          (f) => f.field.join(".") === "podcastId" && f.operator === "eq",
        );

        if (!podcastIdFilter) return [];

        const podcastId = podcastIdFilter.value as string;
        const podcast = podcastsCollection.get(podcastId);

        if (!podcast?.xmlUrl) return [];

        const feed = await parseFeedUrl(podcast.xmlUrl);

        return [{ ...feed, podcastId }];
      },
    }),
  }),
);
