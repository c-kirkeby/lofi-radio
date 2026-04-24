import pino from "pino";

const logger = pino()

import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url }) => {
  const target = url.searchParams.get('url')

  if (!target) {
    return new Response("Missing 'url' parameter", {
      status: 400
    });
  }

  let targetUrl;

  try {
    targetUrl = new URL(target);
  } catch (_error) {
    logger.error(`Invalid URL: ${target}`);
    return new Response("Invalid URL")
  }

  try {
    const response = await fetch(targetUrl)

    const headers = new Headers(response.headers);
    headers.delete('content-encoding');
    headers.delete('transfer-encoding');

    return new Response(response.body, {
      headers
    });
  } catch (error) {
    logger.error(error)
  }
  return new Response("Generic error", { status: 500 });
}

export const OPTIONS: RequestHandler = ({ request }) => {
  const origin = request.headers.get('origin');
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': origin ?? '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Max-Age': '86400',
    }
  })
}
