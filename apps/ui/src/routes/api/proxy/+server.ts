import type { RequestHandler } from "./$types";

const USER_AGENT = "LofiRadio/1.0";

function isPrivateHost(hostname: string): boolean {
  // Exact matches
  return hostname === "localhost" ||
    hostname === "0.0.0.0" ||
    hostname === "::1" ||
    hostname === "metadata.amazonaws.com" ||
    hostname === "metadata.google.internal" ||
    // IPv4 ranges
    hostname.startsWith("0.") ||
    hostname.startsWith("10.") ||
    hostname.startsWith("127.") ||
    hostname.startsWith("169.254.") ||
    hostname.startsWith("192.168.") ||
    // IPv6 ranges
    hostname.startsWith("fc00:") ||
    hostname.startsWith("fd") ||
    hostname.startsWith("ff") ||
    // Ranges requiring regex
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname) ||
    /^2(2[4-9]|3\d)\./.test(hostname);
}


export const GET: RequestHandler = async ({ url, request, fetch }) => {
  // Only serve requests that originate from this app.
  const requestOrigin =
    request.headers.get("origin") ??
    (() => {
      const referer = request.headers.get("referer");
      try {
        return referer ? new URL(referer).origin : null;
      } catch {
        return null;
      }
    })();

  if (requestOrigin !== url.origin) {
    return new Response("Forbidden", { status: 403 });
  }

  const target = url.searchParams.get("url");

  if (!target) {
    return new Response("Missing 'url' parameter", { status: 400 });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(target);
  } catch {
    return new Response("Invalid URL", { status: 400 });
  }

  if (targetUrl.protocol !== "http:" && targetUrl.protocol !== "https:") {
    return new Response("Only http and https URLs are allowed", { status: 400 });
  }

  const { hostname } = targetUrl;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  const response = await fetch(targetUrl.toString(), {
    headers: { "User-Agent": USER_AGENT },
    signal: controller.signal,
  }).catch(() => null).finally(() => clearTimeout(timeout));

  if (isPrivateHost(hostname)) {
    return new Response("Forbidden", { status: 403 });
  }

  if (!response) return new Response("Upstream request failed", { status: 502 });

  const headers = new Headers(response.headers);
  headers.delete("content-encoding");
  headers.delete("content-length");
  headers.delete("transfer-encoding");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
};
