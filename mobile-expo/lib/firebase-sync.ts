import { collection, doc, getDocs, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { dbPath } from './db';
import { useExtensionStore, ExtensionRecord, ExtensionMeta } from './registry';

function parseMetadata(source: string): ExtensionMeta {
  const extract = (tag: string) => {
    const match = source.match(new RegExp(`@${tag}\\s+(.+)`));
    return match ? match[1].trim() : '';
  };
  return {
    name: extract('name'),
    description: extract('description'),
    icon: extract('icon'),
    version: extract('version'),
    author: extract('author'),
  };
}

function docToRecord(id: string, data: Record<string, any>): ExtensionRecord {
  const updatedAt =
    typeof data.updatedAt === 'number'
      ? data.updatedAt
      : data.updatedAt?.toMillis?.() ?? Date.now();
  return {
    id,
    source: data.contents ?? '',
    installedAt: Date.now(),
    updatedAt,
    meta: parseMetadata(data.contents ?? ''),
  };
}

const EXTENSIONS_PATH = dbPath('__crotchetExtensions');

async function fetchAllExtensions() {
  useExtensionStore.getState().setStatus('loading');
  try {
    const snapshot = await getDocs(collection(db, ...EXTENSIONS_PATH));
    const extensions: Record<string, ExtensionRecord> = {};
    snapshot.forEach((docSnap) => {
      extensions[docSnap.id] = docToRecord(docSnap.id, docSnap.data());
    });
    useExtensionStore.getState().setExtensions(extensions);
  } catch (e) {
    console.error('[firebase-sync] fetch failed', e);
    useExtensionStore.getState().setStatus('ready');
  }
}

// Called from the Extensions screen Update button
export async function updateExtension(id: string) {
  const docSnap = await getDoc(doc(db, ...EXTENSIONS_PATH, id));
  if (!docSnap.exists()) return;
  useExtensionStore.getState().updateExtension(id, docToRecord(id, docSnap.data()));
}

function setupSync() {
  const hasExtensions = Object.keys(useExtensionStore.getState().extensions).length > 0;

  if (!hasExtensions) {
    fetchAllExtensions();
  } else {
    useExtensionStore.getState().setStatus('ready');
  }

  if (__DEV__) {
    onSnapshot(collection(db, ...EXTENSIONS_PATH), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' || change.type === 'modified') {
          useExtensionStore
            .getState()
            .updateExtension(change.doc.id, docToRecord(change.doc.id, change.doc.data()));
        }
      });
    });
  }
}

// After Zustand rehydrates from AsyncStorage, decide whether to fetch from Firebase
if (useExtensionStore.persist.hasHydrated()) {
  setupSync();
} else {
  useExtensionStore.persist.onFinishHydration(setupSync);
}
