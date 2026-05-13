import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ExtensionMeta = {
  name: string;
  description: string;
  icon: string;
  version: string;
  author: string;
};

export type ExtensionRecord = {
  id: string;
  source: string;
  installedAt: number;
  updatedAt: number;
  meta: ExtensionMeta;
};

type ExtensionStore = {
  extensions: Record<string, ExtensionRecord>;
  status: 'idle' | 'loading' | 'ready';
  setExtensions: (extensions: Record<string, ExtensionRecord>) => void;
  updateExtension: (id: string, record: ExtensionRecord) => void;
  setStatus: (status: 'idle' | 'loading' | 'ready') => void;
};

export const useExtensionStore = create<ExtensionStore>()(
  persist(
    (set) => ({
      extensions: {},
      status: 'idle',
      setExtensions: (extensions) => set({ extensions, status: 'ready' }),
      updateExtension: (id, record) =>
        set((state) => ({ extensions: { ...state.extensions, [id]: record } })),
      setStatus: (status) => set({ status }),
    }),
    {
      name: 'crotchet-extensions',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist extension data, not transient status
      partialize: (state) => ({ extensions: state.extensions }),
    }
  )
);
