import { app, BrowserWindow, globalShortcut, ipcMain, clipboard, shell } from "electron";
import { dirname, join } from "node:path";
import { readFile, writeFile } from "node:fs/promises";
import { IpcChannel, ClipboardReadPayload, ClipboardWritePayload, FileReadPayload, FileWritePayload, WindowOpenFloatingPayload, WindowCloseFloatingPayload, DeeplinkOpenPayload } from "./ipc/channels";
import { createTray } from "./tray";
import { createFloatingWindow, closeFloatingWindow } from "./windows/floatingWindow";

const __dirname = __filename ? dirname(__filename) : process.cwd();

let mainWindow: BrowserWindow | null = null;

function getDevServerUrl(): string | undefined {
  return process.env.VITE_DEV_SERVER_URL || "http://localhost:5175";
}

async function createMainWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 750,
    height: 480,
    show: false, // Start hidden per plan
    autoHideMenuBar: true,
    frame: false, // Frameless per plan
    transparent: true, // Transparent per plan
    alwaysOnTop: true, // Always on top per plan
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  const devUrl = getDevServerUrl();
  if (devUrl) {
    await mainWindow.loadURL(devUrl);
    // mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    // Load built index.html in production
    await mainWindow.loadFile(join(__dirname, "../../dist/renderer/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.on("blur", () => {
    mainWindow?.hide();
  });
}

// Setup IPC handlers
function setupIpcHandlers(): void {
  // Clipboard handlers
  ipcMain.handle(IpcChannel.ClipboardRead, async (_, payload: ClipboardReadPayload) => {
    try {
      if (payload.format === 'html') {
        return clipboard.readHTML();
      }
      return clipboard.readText();
    } catch (error) {
      throw new Error(`Failed to read clipboard: ${error}`);
    }
  });

  ipcMain.handle(IpcChannel.ClipboardWrite, async (_, payload: ClipboardWritePayload) => {
    try {
      if (payload.html) {
        clipboard.writeHTML(payload.html);
      } else {
        clipboard.writeText(payload.text);
      }
    } catch (error) {
      throw new Error(`Failed to write clipboard: ${error}`);
    }
  });

  // File handlers
  ipcMain.handle(IpcChannel.FileRead, async (_, payload: FileReadPayload) => {
    try {
      return await readFile(payload.path, 'utf8');
    } catch (error) {
      throw new Error(`Failed to read file: ${error}`);
    }
  });

  ipcMain.handle(IpcChannel.FileWrite, async (_, payload: FileWritePayload) => {
    try {
      await writeFile(payload.path, payload.content, payload.encoding || 'utf8');
    } catch (error) {
      throw new Error(`Failed to write file: ${error}`);
    }
  });

  // Window handlers
  ipcMain.handle(IpcChannel.WindowOpenFloating, async (_, payload: WindowOpenFloatingPayload) => {
    try {
      const window = createFloatingWindow(payload);
      return payload.id || `floating-${Date.now()}`;
    } catch (error) {
      throw new Error(`Failed to open floating window: ${error}`);
    }
  });

  ipcMain.handle(IpcChannel.WindowCloseFloating, async (_, payload: WindowCloseFloatingPayload) => {
    try {
      return closeFloatingWindow(payload.id);
    } catch (error) {
      throw new Error(`Failed to close floating window: ${error}`);
    }
  });

  // Deep link handler
  ipcMain.handle(IpcChannel.DeeplinkOpen, async (_, payload: DeeplinkOpenPayload) => {
    try {
      console.log(`Opening deep link: ${payload.url}`);
      // For now just log - in real implementation would handle app navigation
      if (payload.url.startsWith('http')) {
        await shell.openExternal(payload.url);
      }
    } catch (error) {
      throw new Error(`Failed to open deep link: ${error}`);
    }
  });
}

app.whenReady().then(async () => {
  // Hide dock icon on macOS
  if (process.platform === 'darwin') {
    app.dock.hide();
  }
  
  // Set protocol handler for deep links
  app.setAsDefaultProtocolClient('crochet-app-hybrid');
  
  // Setup IPC handlers
  setupIpcHandlers();
  
  await createMainWindow();
  
  // Create system tray
  createTray(mainWindow);

  // Global hotkey (Alt+/) toggles visibility
  globalShortcut.register("Alt+/", () => {
    if (!mainWindow) return;
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// Handle protocol for deep links
app.on('open-url', (event, url) => {
  event.preventDefault();
  console.log(`Received deep link: ${url}`);
  // Forward to renderer if main window exists
  if (mainWindow) {
    mainWindow.webContents.send('deep-link', url);
  }
});
