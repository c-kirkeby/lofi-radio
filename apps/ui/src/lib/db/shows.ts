import type { OPMLFeed } from "$lib/opml";
import { openDB, STORES } from "./client";

/** Retrieve all cached shows from IndexedDB, with their autoincrement ids. */
export async function getCachedShows(): Promise<OPMLFeed[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.shows, "readonly");
    const store = transaction.objectStore(STORES.shows);
    const recordsReq = store.getAll();
    const keysReq = store.getAllKeys();

    transaction.oncomplete = () => {
      const records = recordsReq.result as OPMLFeed[];
      const keys = keysReq.result as number[];
      resolve(records.map((show, i) => ({ ...show, id: keys[i] })));
    };
    transaction.onerror = () => reject(transaction.error);
  });
}

/**
 * Persist a list of shows to IndexedDB.
 * Returns the same shows with their assigned autoincrement ids.
 */
export async function cacheShows(shows: OPMLFeed[]): Promise<OPMLFeed[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.shows, "readwrite");
    const store = transaction.objectStore(STORES.shows);
    const ids: number[] = [];

    for (const show of shows) {
      const req = store.put(show);
      req.onsuccess = () => ids.push(req.result as number);
    }

    transaction.oncomplete = () => resolve(shows.map((show, i) => ({ ...show, id: ids[i] })));
    transaction.onerror = () => reject(transaction.error);
  });
}
