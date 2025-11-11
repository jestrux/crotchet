import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Page } from '@/types';
import { listen } from '@/lib/registry';
import { loadExtensions } from '@/extensions';

type AppContextType = {
  pages: Page[];
  pushPage: (page: Page) => void;
  popPage: () => void;
  userName: string;
  setUserName: (name: string) => void;
  shortcuts: string[];
  setShortcuts: (shortcuts: string[]) => void;
  widgets: string[];
  setWidgets: (widgets: string[]) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [pages, setPages] = useState<Page[]>([]);
  const [userName, setUserName] = useState('Walter');
  const [shortcuts, setShortcuts] = useState<string[]>([
    'clipboard',
    'pinboard',
    'search',
    'camera',
  ]);
  const [widgets, setWidgets] = useState<string[]>([
    'pinboard-widget',
    'quick-actions',
  ]);

  useEffect(() => {
    // Load extensions on mount
    loadExtensions();

    // Listen for extension updates
    const unsubscribe = listen('extensions-updated', () => {
      console.log('Extensions updated');
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const pushPage = (page: Page) => {
    setPages((prev) => [...prev, page]);
  };

  const popPage = () => {
    setPages((prev) => prev.slice(0, -1));
  };

  return (
    <AppContext.Provider
      value={{
        pages,
        pushPage,
        popPage,
        userName,
        setUserName,
        shortcuts,
        setShortcuts,
        widgets,
        setWidgets,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
