import { Collection } from "@signaldb/core";
import createIndexedDBAdapter from "@signaldb/indexeddb";
import svelteReactivityAdapter from "@signaldb/svelte";

export const feedsCollection = new Collection<{
  id: string;
  title?: string;
  link?: string;
  description?: string;
  categories?: string[];
  author?: string;
  language?: string;
  image?: string;
}>({
  reactivity: svelteReactivityAdapter,
  persistence: createIndexedDBAdapter("feeds"),
});

export const feedEntriesCollection = new Collection<{
  id: string;
  feedId: string;
  title?: string;
  link: string;
  published: string;
  description: string;
  url: string;
  type: string;
  length: string;
  duration: string;
}>({
  reactivity: svelteReactivityAdapter,
  persistence: createIndexedDBAdapter("feedEntries"),
});
