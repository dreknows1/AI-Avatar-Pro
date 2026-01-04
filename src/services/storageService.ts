import type { SavedAvatar } from '../types';

const DB_NAME = 'BIAM_DB';
const STORE_NAME = 'avatars';
const DB_VERSION = 1;

/**
 * Opens the IndexedDB database.
 */
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("IndexedDB error:", request.error);
      reject(request.error);
    };

    request.onsuccess = (event) => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        // Create the object store with 'id' as the key path
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

/**
 * Retrieves all saved avatars from IndexedDB.
 */
export const getSavedAvatars = async (): Promise<SavedAvatar[]> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        // Sort by creation date (newest first) manually since IDB getAll order isn't guaranteed
        const avatars = request.result as SavedAvatar[];
        avatars.sort((a, b) => b.createdAt - a.createdAt);
        resolve(avatars);
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Failed to load avatars from DB:", error);
    return [];
  }
};

/**
 * Saves an avatar to IndexedDB.
 */
export const saveAvatar = async (avatar: SavedAvatar): Promise<void> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(avatar); // put() updates if exists, adds if not

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Failed to save avatar to DB:", error);
    throw error;
  }
};

/**
 * Deletes an avatar from IndexedDB.
 */
export const deleteAvatar = async (id: string): Promise<void> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Failed to delete avatar from DB:", error);
    throw error;
  }
};
