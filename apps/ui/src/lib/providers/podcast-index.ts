import * as v from "valibot";
import { createFetch, createSchema } from "@better-fetch/fetch";

const schema = createSchema({
  "podcasts/byfeedid": {
    query: v.object({
      id: v.number(),
    }),
    output: v.object({
      status: v.picklist(["true", "false"]),
      query: v.object({
        id: v.string(),
      }),
      feed: v.looseObject({
        id: v.number(),
        podcastGuid: v.string(),
        title: v.string(),
        url: v.string(),
        originalUrl: v.string(),
        link: v.nullable(v.string()),
        description: v.nullable(v.string()),
        author: v.nullable(v.string()),
        ownerName: v.nullable(v.string()),
        image: v.nullable(v.string()),
        artwork: v.nullable(v.string()),
        lastUpdateTime: v.number(),
        lastCrawlTime: v.number(),
        lastParseTime: v.number(),
        lastGoodHttpStatusTime: v.number(),
        lastHttpStatus: v.number(),
        contentType: v.string(),
        itunesId: v.nullable(v.number()),
        itunesType: v.string(),
        generator: v.nullable(v.string()),
        language: v.string(),
        explicit: v.boolean(),
        type: v.picklist([
          0, // RSS
          1, // Atom
        ]),
        medium: v.string(),
        dead: v.picklist([0, 1]),
        chash: v.string(),
        episodeCount: v.number(),
        crawlErrors: v.number(),
        parseErrors: v.number(),
        categories: v.record(v.string(), v.string()),
        locked: v.picklist([0, 1]),
        imageUrlHash: v.number(),
        value: v.optional(v.unknown()),
        funding: v.optional(v.unknown()),
      }),
    }),
  },
  "podcasts/byfeedurl": {
    query: v.object({
      url: v.pipe(v.string(), v.url()),
    }),
    output: v.object({
      status: v.picklist(["true", "false"]),
      query: v.object({
        url: v.string(),
      }),
      feed: v.looseObject({
        id: v.number(),
        podcastGuid: v.string(),
        title: v.string(),
        url: v.string(),
        originalUrl: v.string(),
        link: v.nullable(v.string()),
        description: v.nullable(v.string()),
        author: v.nullable(v.string()),
        ownerName: v.nullable(v.string()),
        image: v.nullable(v.string()),
        artwork: v.nullable(v.string()),
        lastUpdateTime: v.number(),
        lastCrawlTime: v.number(),
        lastParseTime: v.number(),
        lastGoodHttpStatusTime: v.number(),
        lastHttpStatus: v.number(),
        contentType: v.string(),
        itunesId: v.nullable(v.number()),
        itunesType: v.string(),
        generator: v.nullable(v.string()),
        language: v.string(),
        explicit: v.boolean(),
        type: v.picklist([
          0, // RSS
          1, // Atom
        ]),
        medium: v.string(),
        dead: v.picklist([0, 1]),
        chash: v.string(),
        episodeCount: v.number(),
        crawlErrors: v.number(),
        parseErrors: v.number(),
        categories: v.record(v.string(), v.string()),
        locked: v.picklist([0, 1]),
        imageUrlHash: v.number(),
        value: v.optional(v.unknown()),
        funding: v.optional(v.unknown()),
      }),
    }),
  },
  "/search/byterm": {
    query: v.object({
      q: v.string(),
      val: v.optional(v.picklist(["any", "lightning", "hive", "webmonetization"] as const)),
      max: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(1000))),
      aponly: v.optional(v.boolean(), true),
    }),
    output: v.looseObject({
      status: v.picklist(["true", "false"]),
      feeds: v.array(
        v.looseObject({
          id: v.number(),
          podcastGuid: v.string(),
          title: v.string(),
          url: v.string(),
          link: v.nullable(v.string()),
          description: v.nullable(v.string()),
          author: v.nullable(v.string()),
          ownerName: v.nullable(v.string()),
          image: v.nullable(v.string()),
          artwork: v.nullable(v.string()),
          lastUpdateTime: v.number(),
          lastCrawlTime: v.number(),
          lastParseTime: v.number(),
          lastGoodHttpStatusTime: v.number(),
          contentType: v.string(),
          itunesId: v.nullable(v.number()),
          generator: v.nullable(v.string()),
          language: v.string(),
          explicit: v.boolean(),
          type: v.picklist([
            0, // RSS
            1, // Atom
          ]),
          medium: v.string(),
          dead: v.picklist([0, 1]),
          episodeCount: v.number(),
          crawlErrors: v.number(),
          parseErrors: v.number(),
          locked: v.picklist([0, 1]),
        }),
      ),
      count: v.number(),
      query: v.string(),
      description: v.string(),
    }),
  },
});

export const podcastIndexClient = createFetch({
  baseURL: "/api/podcast-index",
  schema,
  onError: (error) => {
    console.error("[PodcastIndex] request error:", error);
  },
});
