import { Collection } from "@signaldb/core";
import createIndexedDBAdapter from "@signaldb/indexeddb";
import svelteReactivityAdapter from "@signaldb/svelte";

export type FeedEntry = {
  id?: string;
  title?: string;
  link: string;
  published: string;
  description: string;
  url: string;
  type: string;
  length: string;
  duration: string;
};

export const feedsCollection = new Collection<{
  id: string;
  title?: string;
  link?: string;
  description?: string;
  categories?: string[];
  author?: string;
  language?: string;
  image?: string;
  entries?: FeedEntry[];
}>({
  reactivity: svelteReactivityAdapter,
  persistence: createIndexedDBAdapter("feeds"),
});
