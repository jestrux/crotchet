"use strict";

// src/main/index.ts
var import_electron3 = require("electron");
var import_node_path3 = require("node:path");
var import_promises = require("node:fs/promises");

// src/main/tray.ts
var import_electron = require("electron");
var import_node_path = require("node:path");
var __dirname = __filename ? (0, import_node_path.dirname)(__filename) : process.cwd();
function createTray(mainWindow2) {
  const tray = new import_electron.Tray((0, import_node_path.join)(__dirname, "tray-icon.png"));
  const contextMenu = import_electron.Menu.buildFromTemplate([
    {
      label: "Show",
      click: () => {
        if (mainWindow2) {
          mainWindow2.show();
          mainWindow2.focus();
        }
      }
    },
    {
      label: "Hide",
      click: () => {
        if (mainWindow2) {
          mainWindow2.hide();
        }
      }
    },
    {
      type: "separator"
    },
    {
      label: "About Crotchet",
      click: () => {
        console.log("About Crotchet");
      }
    },
    {
      type: "separator"
    },
    {
      label: "Quit",
      click: () => {
        import_electron.app.quit();
      }
    }
  ]);
  tray.setContextMenu(contextMenu);
  tray.setToolTip("Crotchet - Command Palette");
  return tray;
}

// src/main/windows/floatingWindow.ts
var import_electron2 = require("electron");
var import_node_path2 = require("node:path");
var __dirname2 = __filename ? (0, import_node_path2.dirname)(__filename) : process.cwd();
var floatingWindows = /* @__PURE__ */ new Map();
function createFloatingWindow(options = {}) {
  const {
    id = `floating-${Date.now()}`,
    width = 300,
    height = 200,
    x,
    y,
    title = "Floating Window",
    content = "<h1>Floating Window</h1><p>Content here</p>"
  } = options;
  if (floatingWindows.has(id)) {
    const existingWindow = floatingWindows.get(id);
    if (existingWindow && !existingWindow.isDestroyed()) {
      existingWindow.close();
    }
  }
  const window = new import_electron2.BrowserWindow({
    width,
    height,
    x,
    y,
    title,
    alwaysOnTop: true,
    frame: false,
    transparent: true,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      preload: (0, import_node_path2.join)(__dirname2, "../preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            margin: 0;
            padding: 16px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            font-family: system-ui;
            border-radius: 8px;
            backdrop-filter: blur(10px);
          }
          h1 { margin: 0 0 8px 0; font-size: 16px; }
          p { margin: 0; font-size: 14px; opacity: 0.8; }
        </style>
      </head>
      <body>${content}</body>
    </html>
  `;
  window.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
  floatingWindows.set(id, window);
  window.on("closed", () => {
    floatingWindows.delete(id);
  });
  return window;
}
function closeFloatingWindow(id) {
  const window = floatingWindows.get(id);
  if (window && !window.isDestroyed()) {
    window.close();
    return true;
  }
  return false;
}

// src/main/index.ts
var __dirname3 = __filename ? (0, import_node_path3.dirname)(__filename) : process.cwd();
var mainWindow = null;
function getDevServerUrl() {
  return process.env.VITE_DEV_SERVER_URL || "http://localhost:5175";
}
async function createMainWindow() {
  mainWindow = new import_electron3.BrowserWindow({
    width: 750,
    height: 480,
    show: false,
    // Start hidden per plan
    autoHideMenuBar: true,
    frame: false,
    // Frameless per plan
    transparent: true,
    // Transparent per plan
    alwaysOnTop: true,
    // Always on top per plan
    webPreferences: {
      preload: (0, import_node_path3.join)(__dirname3, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });
  const devUrl = getDevServerUrl();
  if (devUrl) {
    await mainWindow.loadURL(devUrl);
  } else {
    await mainWindow.loadFile((0, import_node_path3.join)(__dirname3, "../../dist/renderer/index.html"));
  }
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  mainWindow.on("blur", () => {
    mainWindow?.hide();
  });
}
function setupIpcHandlers() {
  import_electron3.ipcMain.handle("clipboard/read" /* ClipboardRead */, async (_, payload) => {
    try {
      if (payload.format === "html") {
        return import_electron3.clipboard.readHTML();
      }
      return import_electron3.clipboard.readText();
    } catch (error) {
      throw new Error(`Failed to read clipboard: ${error}`);
    }
  });
  import_electron3.ipcMain.handle("clipboard/write" /* ClipboardWrite */, async (_, payload) => {
    try {
      if (payload.html) {
        import_electron3.clipboard.writeHTML(payload.html);
      } else {
        import_electron3.clipboard.writeText(payload.text);
      }
    } catch (error) {
      throw new Error(`Failed to write clipboard: ${error}`);
    }
  });
  import_electron3.ipcMain.handle("files/read" /* FileRead */, async (_, payload) => {
    try {
      return await (0, import_promises.readFile)(payload.path, "utf8");
    } catch (error) {
      throw new Error(`Failed to read file: ${error}`);
    }
  });
  import_electron3.ipcMain.handle("files/write" /* FileWrite */, async (_, payload) => {
    try {
      await (0, import_promises.writeFile)(payload.path, payload.content, payload.encoding || "utf8");
    } catch (error) {
      throw new Error(`Failed to write file: ${error}`);
    }
  });
  import_electron3.ipcMain.handle("windows/openFloating" /* WindowOpenFloating */, async (_, payload) => {
    try {
      const window = createFloatingWindow(payload);
      return payload.id || `floating-${Date.now()}`;
    } catch (error) {
      throw new Error(`Failed to open floating window: ${error}`);
    }
  });
  import_electron3.ipcMain.handle("windows/closeFloating" /* WindowCloseFloating */, async (_, payload) => {
    try {
      return closeFloatingWindow(payload.id);
    } catch (error) {
      throw new Error(`Failed to close floating window: ${error}`);
    }
  });
  import_electron3.ipcMain.handle("deeplinks/open" /* DeeplinkOpen */, async (_, payload) => {
    try {
      console.log(`Opening deep link: ${payload.url}`);
      if (payload.url.startsWith("http")) {
        await import_electron3.shell.openExternal(payload.url);
      }
    } catch (error) {
      throw new Error(`Failed to open deep link: ${error}`);
    }
  });
}
import_electron3.app.whenReady().then(async () => {
  if (process.platform === "darwin") {
    import_electron3.app.dock.hide();
  }
  import_electron3.app.setAsDefaultProtocolClient("crochet-app-hybrid");
  setupIpcHandlers();
  await createMainWindow();
  createTray(mainWindow);
  import_electron3.globalShortcut.register("Alt+/", () => {
    if (!mainWindow) return;
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });
  import_electron3.app.on("activate", () => {
    if (import_electron3.BrowserWindow.getAllWindows().length === 0) {
      void createMainWindow();
    }
  });
});
import_electron3.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") import_electron3.app.quit();
});
import_electron3.app.on("open-url", (event, url) => {
  event.preventDefault();
  console.log(`Received deep link: ${url}`);
  if (mainWindow) {
    mainWindow.webContents.send("deep-link", url);
  }
});
//# sourceMappingURL=index.js.map
