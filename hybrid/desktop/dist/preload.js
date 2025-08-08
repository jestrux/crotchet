"use strict";

// src/main/preload.ts
var import_electron = require("electron");
import_electron.contextBridge.exposeInMainWorld("crotchet", {
  version: "0.0.1",
  // Clipboard API
  clipboard: {
    read: (format) => import_electron.ipcRenderer.invoke("clipboard/read" /* ClipboardRead */, { format }),
    write: (text, html) => import_electron.ipcRenderer.invoke("clipboard/write" /* ClipboardWrite */, { text, html })
  },
  // Files API
  files: {
    read: (path) => import_electron.ipcRenderer.invoke("files/read" /* FileRead */, { path }),
    write: (path, content, encoding) => import_electron.ipcRenderer.invoke("files/write" /* FileWrite */, { path, content, encoding })
  },
  // Windows API
  windows: {
    openFloating: (options) => import_electron.ipcRenderer.invoke("windows/openFloating" /* WindowOpenFloating */, options),
    closeFloating: (id) => import_electron.ipcRenderer.invoke("windows/closeFloating" /* WindowCloseFloating */, { id })
  },
  // Deep links API
  deeplinks: {
    open: (url) => import_electron.ipcRenderer.invoke("deeplinks/open" /* DeeplinkOpen */, { url })
  }
});
//# sourceMappingURL=preload.js.map
