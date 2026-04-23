export interface OPMLFeed {
  /** The display name of the show/feed */
  text: string;
  /** The RSS feed URL */
  xmlUrl: string;
  /** Feed type, e.g. "rss" */
  type?: string;
}

export interface OPMLDocument {
  /** OPML spec version, normalised to "1.0" */
  version: string;
  title?: string;
  feeds: OPMLFeed[];
}
