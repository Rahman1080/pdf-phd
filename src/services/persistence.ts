/**
 * PDF Studio - Persistence Service
 * Uses IndexedDB to persist PDF files and editor state across page refreshes
 */

const DB_NAME = 'PDFStudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'pdfSession';

export interface SerializedTab {
    id: string;
    title: string;
    fileName: string;
    fileData: ArrayBuffer;
    elements: { [page: number]: any[] };
    pageBackgrounds: { [page: number]: string };
    pages: any[];
    extractedText: { [page: number]: any[] };
    currentPage: number;
    zoom: number;
}

interface PersistentState {
    id: string; // 'current'
    tabs: SerializedTab[];
    activeTabId: string | null;
    lastModified: number;
}

class PersistenceService {
    private db: IDBDatabase | null = null;
    private initPromise: Promise<void> | null = null;

    async init(): Promise<void> {
        if (this.db) return;
        if (this.initPromise) return this.initPromise;

        this.initPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                console.error('Failed to open IndexedDB:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('📦 PDF Studio: IndexedDB initialized');
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                // Create object store for PDF sessions
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                    console.log('📦 PDF Studio: Created object store');
                }
            };
        });

        return this.initPromise;
    }

    async saveState(state: {
        tabs: SerializedTab[];
        activeTabId: string | null;
    }): Promise<void> {
        await this.init();
        if (!this.db) throw new Error('Database not initialized');

        const persistentState: PersistentState = {
            id: 'current',
            ...state,
            lastModified: Date.now(),
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(persistentState);

            request.onsuccess = () => {
                console.log('💾 PDF Studio: State saved');
                resolve();
            };

            request.onerror = () => {
                console.error('Failed to save state:', request.error);
                reject(request.error);
            };
        });
    }

    async loadState(): Promise<PersistentState | null> {
        await this.init();
        if (!this.db) return null;

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get('current');

            request.onsuccess = () => {
                const result = request.result as PersistentState | undefined;
                if (result) {
                    console.log('📂 PDF Studio: State loaded from storage');
                }
                resolve(result || null);
            };

            request.onerror = () => {
                console.error('Failed to load state:', request.error);
                reject(request.error);
            };
        });
    }

    async clearState(): Promise<void> {
        await this.init();
        if (!this.db) return;

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete('current');

            request.onsuccess = () => {
                console.log('🗑️ PDF Studio: State cleared');
                resolve();
            };

            request.onerror = () => {
                console.error('Failed to clear state:', request.error);
                reject(request.error);
            };
        });
    }

    async hasStoredState(): Promise<boolean> {
        try {
            const state = await this.loadState();
            return state !== null;
        } catch {
            return false;
        }
    }
}

// Export singleton instance
export const persistenceService = new PersistenceService();
export type { PersistentState };
