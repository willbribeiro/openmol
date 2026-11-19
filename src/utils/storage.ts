/**
 * Storage utilities for OpenMol
 * Supports both localStorage (for simple data) and IndexedDB (for larger data)
 */

// Simple localStorage wrapper for small data
export function saveToLocalStorage<T>(key: string, data: T): void {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
  } catch (error) {
    console.error(`Failed to save to localStorage:`, error);
  }
}

export function loadFromLocalStorage<T>(key: string): T | null {
  try {
    const serialized = localStorage.getItem(key);
    if (!serialized) return null;
    return JSON.parse(serialized) as T;
  } catch (error) {
    console.error(`Failed to load from localStorage:`, error);
    return null;
  }
}

export function removeFromLocalStorage(key: string): void {
  localStorage.removeItem(key);
}

/**
 * IndexedDB wrapper for larger data and more complex storage needs
 */
let db: IDBDatabase | null = null;

export async function initIndexedDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve();
      return;
    }

    const request = indexedDB.open('OpenMolStorage', 1);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      resolve();
    };
  });
}

export async function saveToIndexedDB(data: { id: string; molecule: any; timestamp: number }): Promise<void> {
  if (!db) await initIndexedDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(['molecules'], 'readwrite');
    const store = transaction.objectStore('molecules');
    
    const request = store.put({
      id: data.id,
      molecule: data.molecule,
      timestamp: data.timestamp,
    });

    request.addEventListener('success', () => {
      resolve();
    });

    request.addEventListener('error', (event) => {
      reject((event.target as IDBRequest).error);
    });
  });
}

export async function loadFromIndexedDB(id: string): Promise<any | null> {
  if (!db) await initIndexedDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(['molecules'], 'readonly');
    const store = transaction.objectStore('molecules');
    
    const request = store.get(id);

    request.addEventListener('success', (event) => {
      const result = (event.target as IDBRequest<any>).result;
      resolve(result ? result.molecule : null);
    });

    request.addEventListener('error', (event) => {
      reject((event.target as IDBRequest).error);
    });
  });
}

export async function listFromIndexedDB(): Promise<any[]> {
  if (!db) await initIndexedDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(['molecules'], 'readonly');
    const store = transaction.objectStore('molecules');
    
    const request = store.getAll();

    request.addEventListener('success', (event) => {
      resolve((event.target as IDBRequest<any>).result);
    });

    request.addEventListener('error', (event) => {
      reject((event.target as IDBRequest).error);
    });
  });
}

export async function removeFromIndexedDB(id: string): Promise<void> {
  if (!db) await initIndexedDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(['molecules'], 'readwrite');
    const store = transaction.objectStore('molecules');
    
    const request = store.delete(id);

    request.addEventListener('success', () => {
      resolve();
    });

    request.addEventListener('error', (event) => {
      reject((event.target as IDBRequest).error);
    });
  });
}

/**
 * Clear all stored data
 */
export async function clearStorage(): Promise<void> {
  // Clear localStorage
  localStorage.clear();
  
  // Clear IndexedDB
  if (db) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase('OpenMolStorage');
      
      request.addEventListener('success', () => {
        db = null;
        resolve();
      });

      request.addEventListener('error', (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      });
    });
  }
}
