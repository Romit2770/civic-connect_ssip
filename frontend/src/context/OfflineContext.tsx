import React, { createContext, useContext, useState, useEffect } from 'react';
import { openDB, IDBPDatabase } from 'idb';

interface OfflineReportDraft {
  id: string;
  category: string;
  subcategory?: string;
  description: string;
  latitude: number;
  longitude: number;
  address?: string;
  voiceTranscript?: string;
  photoDataUrl?: string;
  problemImpact?: string[];
  problemSince?: string;
  savedAt: string;
}

interface OfflineContextType {
  isOnline: boolean;
  drafts: OfflineReportDraft[];
  saveDraft: (draft: Omit<OfflineReportDraft, 'id' | 'savedAt'>) => Promise<string>;
  deleteDraft: (id: string) => Promise<void>;
  getDrafts: () => Promise<OfflineReportDraft[]>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB('civicconnect_offline', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('drafts')) {
          db.createObjectStore('drafts', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [drafts, setDrafts] = useState<OfflineReportDraft[]>([]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    loadDrafts();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadDrafts = async () => {
    try {
      const db = await getDb();
      const allDrafts = await db.getAll('drafts');
      setDrafts(allDrafts || []);
    } catch (e) {
      console.warn('Failed to load offline drafts from IndexedDB');
    }
  };

  const saveDraft = async (data: Omit<OfflineReportDraft, 'id' | 'savedAt'>): Promise<string> => {
    const id = `draft_${Date.now()}`;
    const draft: OfflineReportDraft = {
      ...data,
      id,
      savedAt: new Date().toISOString(),
    };

    const db = await getDb();
    await db.put('drafts', draft);
    await loadDrafts();
    return id;
  };

  const deleteDraft = async (id: string) => {
    const db = await getDb();
    await db.delete('drafts', id);
    await loadDrafts();
  };

  const getDrafts = async () => {
    const db = await getDb();
    return db.getAll('drafts');
  };

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        drafts,
        saveDraft,
        deleteDraft,
        getDrafts,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}
