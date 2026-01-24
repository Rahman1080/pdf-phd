// Version History & Autosave Service
import { useState, useEffect } from 'react';
import { X, Clock, RotateCcw, Trash2, Save, History } from 'lucide-react';
import { generateId } from '../utils/helpers';

interface Version {
    id: string;
    timestamp: Date;
    label?: string;
    fileSize: number;
    data: ArrayBuffer;
    thumbnail?: string;
}

interface VersionHistoryProps {
    documentId: string;
    currentDocumentData: ArrayBuffer;
    onRestore: (data: ArrayBuffer) => void;
    onClose: () => void;
}

const STORAGE_KEY_PREFIX = 'pdf-studio-version-';
const MAX_VERSIONS = 10;
const AUTOSAVE_INTERVAL = 60000; // 1 minute

// Version History Service (can be used outside React components)
export const versionService = {
    saveVersion: (documentId: string, data: ArrayBuffer, label?: string): Version => {
        const version: Version = {
            id: generateId(),
            timestamp: new Date(),
            label,
            fileSize: data.byteLength,
            data,
        };

        const versions = versionService.getVersions(documentId);
        versions.unshift(version);

        // Keep only MAX_VERSIONS
        while (versions.length > MAX_VERSIONS) {
            versions.pop();
        }

        // Store metadata separately (localStorage) and data in IndexedDB
        versionService.storeVersions(documentId, versions);

        return version;
    },

    getVersions: (documentId: string): Version[] => {
        try {
            const metadataStr = localStorage.getItem(`${STORAGE_KEY_PREFIX}${documentId}-meta`);
            if (!metadataStr) return [];

            const metadata = JSON.parse(metadataStr);
            return metadata.map((m: any) => ({
                ...m,
                timestamp: new Date(m.timestamp),
                data: new ArrayBuffer(0), // Will be loaded on demand from IndexedDB
            }));
        } catch (e) {
            console.error('Failed to load versions:', e);
            return [];
        }
    },

    storeVersions: async (documentId: string, versions: Version[]) => {
        // Store metadata in localStorage
        const metadata = versions.map(v => ({
            id: v.id,
            timestamp: v.timestamp.toISOString(),
            label: v.label,
            fileSize: v.fileSize,
        }));
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${documentId}-meta`, JSON.stringify(metadata));

        // Store actual data in IndexedDB
        const db = await versionService.openDB();
        for (const version of versions) {
            if (version.data.byteLength > 0) {
                await versionService.storeVersionData(db, documentId, version.id, version.data);
            }
        }
    },

    loadVersionData: async (documentId: string, versionId: string): Promise<ArrayBuffer | null> => {
        try {
            const db = await versionService.openDB();
            return new Promise((resolve, reject) => {
                const tx = db.transaction('versions', 'readonly');
                const store = tx.objectStore('versions');
                const request = store.get(`${documentId}-${versionId}`);
                request.onsuccess = () => resolve(request.result?.data || null);
                request.onerror = () => reject(request.error);
            });
        } catch (e) {
            console.error('Failed to load version data:', e);
            return null;
        }
    },

    storeVersionData: (db: IDBDatabase, documentId: string, versionId: string, data: ArrayBuffer): Promise<void> => {
        return new Promise((resolve, reject) => {
            const tx = db.transaction('versions', 'readwrite');
            const store = tx.objectStore('versions');
            store.put({ id: `${documentId}-${versionId}`, data });
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    },

    deleteVersion: async (documentId: string, versionId: string) => {
        const versions = versionService.getVersions(documentId).filter(v => v.id !== versionId);

        const metadata = versions.map(v => ({
            id: v.id,
            timestamp: v.timestamp.toISOString(),
            label: v.label,
            fileSize: v.fileSize,
        }));
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${documentId}-meta`, JSON.stringify(metadata));

        // Remove from IndexedDB
        const db = await versionService.openDB();
        const tx = db.transaction('versions', 'readwrite');
        const store = tx.objectStore('versions');
        store.delete(`${documentId}-${versionId}`);
    },

    openDB: (): Promise<IDBDatabase> => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('pdf-studio-versions', 1);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains('versions')) {
                    db.createObjectStore('versions', { keyPath: 'id' });
                }
            };
        });
    },

    clearAllVersions: async (documentId: string) => {
        localStorage.removeItem(`${STORAGE_KEY_PREFIX}${documentId}-meta`);
        // Also clear from IndexedDB
        const db = await versionService.openDB();
        const tx = db.transaction('versions', 'readwrite');
        const store = tx.objectStore('versions');
        const request = store.openCursor();
        request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
            if (cursor) {
                if (cursor.key.toString().startsWith(documentId)) {
                    cursor.delete();
                }
                cursor.continue();
            }
        };
    },
};

// Custom hook for autosave
export function useAutosave(
    documentId: string | undefined,
    getData: () => ArrayBuffer | null,
    enabled: boolean = true
) {
    useEffect(() => {
        if (!enabled || !documentId) return;

        const interval = setInterval(() => {
            const data = getData();
            if (data && data.byteLength > 0) {
                versionService.saveVersion(documentId, data, 'Autosave');
                console.log('Autosaved version at', new Date().toLocaleTimeString());
            }
        }, AUTOSAVE_INTERVAL);

        return () => clearInterval(interval);
    }, [documentId, getData, enabled]);
}

// Version History UI Component
export function VersionHistoryPanel({ documentId, currentDocumentData, onRestore, onClose }: VersionHistoryProps) {
    const [versions, setVersions] = useState<Version[]>([]);
    const [loading, setLoading] = useState(true);
    const [restoring, setRestoring] = useState<string | null>(null);

    useEffect(() => {
        loadVersions();
    }, [documentId]);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const loadVersions = () => {
        setLoading(true);
        const loadedVersions = versionService.getVersions(documentId);
        setVersions(loadedVersions);
        setLoading(false);
    };

    const handleSaveSnapshot = () => {
        const label = prompt('Enter a label for this version (optional):');
        versionService.saveVersion(documentId, currentDocumentData, label || 'Manual Snapshot');
        loadVersions();
    };

    const handleRestore = async (version: Version) => {
        setRestoring(version.id);
        try {
            const data = await versionService.loadVersionData(documentId, version.id);
            if (data) {
                onRestore(data);
                onClose();
            } else {
                alert('Failed to restore version: Data not found');
            }
        } catch (e) {
            console.error('Restore failed:', e);
            alert('Failed to restore version');
        }
        setRestoring(null);
    };

    const handleDelete = async (versionId: string) => {
        if (confirm('Delete this version? This cannot be undone.')) {
            await versionService.deleteVersion(documentId, versionId);
            loadVersions();
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    const formatTimeAgo = (date: Date): string => {
        const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        return `${Math.floor(seconds / 86400)} days ago`;
    };

    return (
        <div className="modal-overlay" style={{ zIndex: 10000 }} onClick={onClose}>
            <div
                className="modal !max-w-lg h-[600px] flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                            <History className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Version History</h2>
                            <p className="text-surface-400 text-sm">Restore previous versions of your document</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-surface-400" />
                    </button>
                </div>

                {/* Save Snapshot Button */}
                <button
                    onClick={handleSaveSnapshot}
                    className="flex items-center justify-center gap-2 w-full py-3 mb-4 bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/30 text-primary-400 rounded-xl font-semibold text-sm transition-colors"
                >
                    <Save className="w-4 h-4" />
                    Save Current Snapshot
                </button>

                {/* Version List */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                    {loading ? (
                        <div className="text-center py-12 text-surface-400">Loading versions...</div>
                    ) : versions.length === 0 ? (
                        <div className="text-center py-12">
                            <Clock className="w-12 h-12 text-surface-600 mx-auto mb-3" />
                            <p className="text-surface-400">No saved versions yet</p>
                            <p className="text-surface-500 text-sm">Versions are saved automatically every minute</p>
                        </div>
                    ) : (
                        versions.map((version, idx) => (
                            <div
                                key={version.id}
                                className={`p-4 bg-white/5 border border-white/10 rounded-xl hover:border-primary-500/30 transition-all ${idx === 0 ? 'ring-2 ring-primary-500/50' : ''
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-semibold text-white">
                                                {version.label || `Version ${versions.length - idx}`}
                                            </span>
                                            {idx === 0 && (
                                                <span className="px-2 py-0.5 bg-primary-500/20 text-primary-400 text-[10px] font-bold rounded-full uppercase">
                                                    Latest
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-surface-500">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatTimeAgo(version.timestamp)}
                                            </span>
                                            <span>{formatFileSize(version.fileSize)}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleRestore(version)}
                                            disabled={restoring === version.id}
                                            className="p-2 bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 rounded-lg transition-colors disabled:opacity-50"
                                            title="Restore this version"
                                        >
                                            <RotateCcw className={`w-4 h-4 ${restoring === version.id ? 'animate-spin' : ''}`} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(version.id)}
                                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                            title="Delete this version"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-xs text-surface-500 text-center">
                        Up to {MAX_VERSIONS} versions are kept. Older versions are automatically removed.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default VersionHistoryPanel;
