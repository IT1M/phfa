const DB_NAME = 'medical-archive-db';
const DB_VERSION = 1;

export interface OfflineDocument {
  id: string;
  patientId: string;
  title: string;
  content: string;
  timestamp: number;
  synced: boolean;
}

class OfflineStorage {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('documents')) {
          db.createObjectStore('documents', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('pending-uploads')) {
          db.createObjectStore('pending-uploads', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('drafts')) {
          db.createObjectStore('drafts', { keyPath: 'id' });
        }
      };
    });
  }

  async saveDocument(doc: OfflineDocument): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['documents'], 'readwrite');
      const store = transaction.objectStore('documents');
      const request = store.put(doc);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getDocument(id: string): Promise<OfflineDocument | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['documents'], 'readonly');
      const store = transaction.objectStore('documents');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllDocuments(): Promise<OfflineDocument[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['documents'], 'readonly');
      const store = transaction.objectStore('documents');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveDraft(id: string, data: any): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['drafts'], 'readwrite');
      const store = transaction.objectStore('drafts');
      const request = store.put({ id, data, timestamp: Date.now() });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getDraft(id: string): Promise<any> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['drafts'], 'readonly');
      const store = transaction.objectStore('drafts');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result?.data || null);
      request.onerror = () => reject(request.error);
    });
  }

  async addPendingUpload(doc: OfflineDocument): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pending-uploads'], 'readwrite');
      const store = transaction.objectStore('pending-uploads');
      const request = store.put(doc);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const offlineStorage = new OfflineStorage();
