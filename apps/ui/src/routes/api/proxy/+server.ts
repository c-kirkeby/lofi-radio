import pino from "pino";

const logger = pino()

import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url, request }) => {
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


  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('sec-fetch-dest');
  headers.delete('sec-fetch-mode');
  headers.delete('sec-fetch-site');
  headers.set('user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  headers.set('accept', '*/*');
  headers.set('accept-language', 'en-US,en;q=0.9');
  headers.set('referer', new URL(targetUrl).origin);
  headers.set('connection', 'keep-alive');

  const origin = request.headers.get('origin');
  try {
    const response = await fetch(targetUrl, { headers })

    const responseHeaders = new Headers(response.headers);

    responseHeaders.delete('content-encoding');
    responseHeaders.delete('transfer-encoding');
    responseHeaders.delete('access-control-allow-headers');
    responseHeaders.delete('access-control-allow-origin');
    responseHeaders.delete('access-control-allow-methods');
    responseHeaders.delete('access-control-allow-credentials');
    responseHeaders.delete('access-control-max-age');
    responseHeaders.delete('access-control-expose-headers');
    responseHeaders.set('access-control-allow-origin', origin ?? '*');
    responseHeaders.set('access-control-expose-headers', '*');
    responseHeaders.set('accept-ranges', 'bytes');

    return new Response(response.body, {
      headers: responseHeaders,
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
