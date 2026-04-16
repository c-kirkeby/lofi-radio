import type { OPMLParserStrategy } from "./strategy.ts";
import type { OPMLDocument } from "./types.ts";
import { OPMLV1Parser } from "./v1-parser.ts";

/**
 * Context class for the OPML parser strategy pattern.
 *
 * Inspects the `version` attribute on the root <opml> element and
 * selects the appropriate parsing strategy. Version 1.1 is treated
 * as version 1.0 per the project requirements. Unknown/missing
 * versions fall back to the v1.0 parser.
 *
 * To support a new version in future, implement OPMLParserStrategy
 * and register it in the `strategies` map below.
 */
export class OPMLParser {
  private strategies = new Map<string, OPMLParserStrategy>([
    ["1.0", new OPMLV1Parser()],
    // 1.1 is treated as 1.0
    ["1.1", new OPMLV1Parser()],
  ]);

  private fallback: OPMLParserStrategy = new OPMLV1Parser();

  /**
   * Parse an OPML XML string into a normalised OPMLDocument.
   */
  parse(xml: string): OPMLDocument {
    const domParser = new DOMParser();
    const doc = domParser.parseFromString(xml, "application/xml");

    const parseError = doc.querySelector("parsererror");
    if (parseError) {
      throw new Error(`Failed to parse OPML XML: ${parseError.textContent?.trim()}`);
    }

    const version = doc.documentElement.getAttribute("version")?.trim() ?? "1.0";
    const strategy = this.strategies.get(version) ?? this.fallback;

    return strategy.parse(doc);
  }
}
