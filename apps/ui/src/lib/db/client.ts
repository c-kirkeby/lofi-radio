const DB_NAME = "lofi";
export const DB_VERSION = 1;

export const STORES = {
  shows: "shows",
  feeds: "feeds",
} as const;

const STORE_CONFIG: Record<string, IDBObjectStoreParameters> = {
  shows: { autoIncrement: true },
  feeds: { keyPath: "id" },
};

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const db = indexedDB.open(DB_NAME, DB_VERSION);
    db.onerror = () => reject(db.error);
    db.onsuccess = () => resolve(db.result);

    db.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      Object.entries(STORE_CONFIG).forEach(([storeName, config]) => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, config);
        }
      });
    };
  });
}
