import type { OPMLDocument } from "./types.ts";

export interface OPMLParserStrategy {
  /**
   * Parse a DOM Document produced from an OPML XML string
   * into a normalised OPMLDocument.
   */
  parse(doc: Document): OPMLDocument;
}
