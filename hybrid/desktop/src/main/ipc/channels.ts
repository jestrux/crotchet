export enum IpcChannel {
  // Clipboard operations
  ClipboardRead = "clipboard/read",
  ClipboardWrite = "clipboard/write",
  
  // File operations
  FileRead = "files/read",
  FileWrite = "files/write",
  
  // Window operations
  WindowOpenFloating = "windows/openFloating",
  WindowCloseFloating = "windows/closeFloating",
  
  // Deep link operations
  DeeplinkOpen = "deeplinks/open",
}

export interface ClipboardReadPayload {
  format?: 'text' | 'html';
}

export interface ClipboardWritePayload {
  text: string;
  html?: string;
}

export interface FileReadPayload {
  path: string;
}

export interface FileWritePayload {
  path: string;
  content: string;
  encoding?: 'utf8' | 'binary';
}

export interface WindowOpenFloatingPayload {
  id?: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  title?: string;
  content?: string;
}

export interface WindowCloseFloatingPayload {
  id: string;
}

export interface DeeplinkOpenPayload {
  url: string;
}

export type IpcPayload = 
  | ClipboardReadPayload
  | ClipboardWritePayload
  | FileReadPayload
  | FileWritePayload
  | WindowOpenFloatingPayload
  | WindowCloseFloatingPayload
  | DeeplinkOpenPayload;
