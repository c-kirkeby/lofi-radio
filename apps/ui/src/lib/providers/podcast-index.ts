import * as v from "valibot";
import { createSchema, type CreateFetchOption } from "@better-fetch/fetch";
import { sha1 } from "@/sha1";
import pino from "pino";

const logger = pino();

const settings = {
  baseUrl: "https://api.podcastindex.org/api/1.0",
  userAgent: "LofiRadio/1.0",
} as const;

const schema = createSchema({
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

async function createAuthHeaders() {
  const authTime = Math.floor(Date.now() / 1000).toString();
  return {
    "Content-Type": "application/json",
    "User-Agent": settings.userAgent,
    "X-Auth-Key": import.meta.env.VITE_PODCAST_INDEX_KEY,
    "X-Auth-Date": authTime,
    Authorization: await sha1(
      import.meta.env.VITE_PODCAST_INDEX_KEY + import.meta.env.VITE_PODCAST_INDEX_SECRET + authTime,
    ),
  };
}

const podcastIndexOptions: CreateFetchOption = {
  baseURL: `/api/proxy?url=${encodeURIComponent(settings.baseUrl)}`,
  onRequest: async (context) => {
    return {
      ...context,
      headers: {
        ...context.headers,
        ...(await createAuthHeaders()),
      },
    };
  },
  schema,
  onError: (error) => {
    logger.error(error);
  },
};

export { podcastIndexOptions, schema as podcastIndexSchema };
