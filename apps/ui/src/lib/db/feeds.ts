import type { FeedData } from "@extractus/feed-extractor";
import { openDB, STORES } from "./client";

/** A cached feed entry — FeedData keyed by the show's numeric id. */
export interface CachedFeed extends FeedData {
  id: number;
}

/** Retrieve a cached feed by the show's numeric id. Returns undefined if not found. */
export async function getCachedFeed(id: number): Promise<CachedFeed | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.feeds, "readonly");
    const store = transaction.objectStore(STORES.feeds);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result as CachedFeed | undefined);
    request.onerror = () => reject(request.error);
  });
}

/** Persist a feed result keyed by the show's numeric id. */
export async function cacheFeed(id: number, data: FeedData): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.feeds, "readwrite");
    const store = transaction.objectStore(STORES.feeds);
    // keyPath: "id" on the store means the id field in the object is the key
    store.put({ ...data, id });
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}
