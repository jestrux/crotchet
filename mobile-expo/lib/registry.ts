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

// Icon descriptor produced by UI.svg / UI.icon stubs in runtime
export type IconDescriptor =
  | { type: 'svg'; path: string; filled?: boolean }
  | { type: 'icon'; name: string }
  | null;

export type ActionRecord = {
  name: string;
  label: string;
  icon: IconDescriptor;
  color?: string;
  handler?: () => void;
};

type ActionStore = {
  actions: ActionRecord[];
  setActions: (actions: ActionRecord[]) => void;
  addAction: (action: ActionRecord) => void;
};

export const useActionStore = create<ActionStore>()((set) => ({
  actions: [],
  setActions: (actions) => set({ actions }),
  addAction: (action) => set((state) => ({ actions: [...state.actions, action] })),
}));

export type WidgetContentType = 'list' | 'media' | 'grid';

export type WidgetRecord = {
  name: string;
  label: string;
  title?: string;
  icon: IconDescriptor;
  content: WidgetContentType | null;
};

type WidgetStore = {
  widgets: WidgetRecord[];
  setWidgets: (widgets: WidgetRecord[]) => void;
  addWidget: (widget: WidgetRecord) => void;
};

export const useWidgetStore = create<WidgetStore>()((set) => ({
  widgets: [],
  setWidgets: (widgets) => set({ widgets }),
  addWidget: (widget) => set((state) => ({ widgets: [...state.widgets, widget] })),
}));

const DEFAULT_HOME_SHORTCUTS = ['spotifyPlayer', 'randomUnsplashPic', 'randomYoutubeClip', 'searchReader'];

type HomeShortcutsStore = {
  shortcutNames: string[];
  setShortcutNames: (names: string[]) => void;
};

export const useHomeShortcutsStore = create<HomeShortcutsStore>()(
  persist(
    (set) => ({
      shortcutNames: DEFAULT_HOME_SHORTCUTS,
      setShortcutNames: (shortcutNames) => set({ shortcutNames }),
    }),
    {
      name: 'crotchet-home-shortcuts',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export type PageRecord = {
  id: string;
  title?: string | ((ctx: any) => string);
  type?: string;           // 'preview' = single-item detail; undefined = list
  resolve?: () => Promise<any>;
  onReady?: (ctx: any) => void;
  action?: any;
  actions?: any;
  isSheet?: boolean;       // true = openActionSheet (bottom-anchored)
};

type PageStore = {
  pages: PageRecord[];
  pushPage: (page: Omit<PageRecord, 'id'>) => void;
  popPage: () => void;
  clearPages: () => void;
};

export const usePageStore = create<PageStore>()((set) => ({
  pages: [],
  pushPage: (page) =>
    set((state) => ({
      pages: [...state.pages, { ...page, id: Math.random().toString(36).slice(2) }],
    })),
  popPage: () => set((state) => ({ pages: state.pages.slice(0, -1) })),
  clearPages: () => set({ pages: [] }),
}));

type ToastStore = {
  message: string | null;
  show: (message: string) => void;
  hide: () => void;
};

export const useToastStore = create<ToastStore>()((set) => ({
  message: null,
  show: (message) => set({ message }),
  hide: () => set({ message: null }),
}));
