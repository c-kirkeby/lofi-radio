import type { OPMLParserStrategy } from "./strategy.ts";
import type { OPMLDocument, OPMLFeed } from "./types.ts";

/**
 * Parses OPML version 1.0 documents.
 * Also handles version 1.1, treating it as equivalent to 1.0.
 */
export class OPMLV1Parser implements OPMLParserStrategy {
  parse(doc: Document): OPMLDocument {
    const title = doc.querySelector("head > title")?.textContent?.trim() ?? undefined;

    const feeds: OPMLFeed[] = [];

    // Collect all <outline> elements that have an xmlUrl attribute (i.e. feed entries).
    // OPML 1.0 may nest them under a grouping <outline text="feeds"> element.
    const outlines = doc.querySelectorAll("body outline[xmlUrl]");

    for (const outline of outlines) {
      const xmlUrl = outline.getAttribute("xmlUrl");
      const text = outline.getAttribute("text");

      if (!xmlUrl || !text) continue;

      feeds.push({
        text: text.trim(),
        xmlUrl: xmlUrl.trim(),
        type: outline.getAttribute("type") ?? undefined,
      });
    }

    return {
      version: "1.0",
      title,
      feeds,
    };
  }
}
