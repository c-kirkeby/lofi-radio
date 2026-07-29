import type { RequestHandler } from "./$types";
import { PODCAST_INDEX_KEY, PODCAST_INDEX_SECRET } from "$app/env/private";
import { sha1 } from "@/server/sha1";

const BASE_URL = "https://api.podcastindex.org/api/1.0";
const USER_AGENT = "LofiRadio/1.0";

export const GET: RequestHandler = async ({ params, request, fetch }) => {
  const { path } = params;
  const { search } = new URL(request.url);
  const url = `${BASE_URL}/${path}${search}`;

  const now = Math.floor(Date.now() / 1000).toString();
  console.debug(
    `[PodcastIndex Proxy] are keys configured - key: ${!!PODCAST_INDEX_KEY.length} ${PODCAST_INDEX_SECRET.length}`,
  );
  const hash = await sha1(PODCAST_INDEX_KEY + PODCAST_INDEX_SECRET + now);

  const newRequest = new Request(url, {
    method: "GET",
    headers: {
      "User-Agent": USER_AGENT,
      Authorization: hash,
      "X-Auth-Key": PODCAST_INDEX_KEY,
      "X-Auth-Date": now,
    },
  });

  console.debug("[PodcastIndex Proxy] Proxying request", { url, method: request.method });

  const response = await fetch(newRequest).catch(() => null);
  if (!response) return new Response("Upstream request failed", { status: 502 });

  const headers = new Headers(response.headers);
  headers.delete("content-encoding");
  headers.delete("content-length");
  headers.delete("transfer-encoding");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};
