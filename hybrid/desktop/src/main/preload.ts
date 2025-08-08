import { contextBridge, ipcRenderer } from "electron";
import { IpcChannel } from "./ipc/channels";

contextBridge.exposeInMainWorld("crotchet", {
  version: "0.0.1",
  
  // Clipboard API
  clipboard: {
    read: (format?: 'text' | 'html') => 
      ipcRenderer.invoke(IpcChannel.ClipboardRead, { format }),
    write: (text: string, html?: string) => 
      ipcRenderer.invoke(IpcChannel.ClipboardWrite, { text, html }),
  },
  
  // Files API
  files: {
    read: (path: string) => 
      ipcRenderer.invoke(IpcChannel.FileRead, { path }),
    write: (path: string, content: string, encoding?: 'utf8' | 'binary') => 
      ipcRenderer.invoke(IpcChannel.FileWrite, { path, content, encoding }),
  },
  
  // Windows API
  windows: {
    openFloating: (options?: {
      id?: string;
      width?: number;
      height?: number;
      x?: number;
      y?: number;
      title?: string;
      content?: string;
    }) => ipcRenderer.invoke(IpcChannel.WindowOpenFloating, options),
    closeFloating: (id: string) => 
      ipcRenderer.invoke(IpcChannel.WindowCloseFloating, { id }),
  },
  
  // Deep links API
  deeplinks: {
    open: (url: string) => 
      ipcRenderer.invoke(IpcChannel.DeeplinkOpen, { url }),
  },
});

declare global {
  interface Window {
    crotchet: {
      version: string;
      clipboard: {
        read: (format?: 'text' | 'html') => Promise<string>;
        write: (text: string, html?: string) => Promise<void>;
      };
      files: {
        read: (path: string) => Promise<string>;
        write: (path: string, content: string, encoding?: 'utf8' | 'binary') => Promise<void>;
      };
      windows: {
        openFloating: (options?: {
          id?: string;
          width?: number;
          height?: number;
          x?: number;
          y?: number;
          title?: string;
          content?: string;
        }) => Promise<string>;
        closeFloating: (id: string) => Promise<boolean>;
      };
      deeplinks: {
        open: (url: string) => Promise<void>;
      };
    };
  }
}
