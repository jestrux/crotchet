import { BrowserWindow } from "electron";
import { join, dirname } from "node:path";

const __dirname = __filename ? dirname(__filename) : process.cwd();

export interface FloatingWindowOptions {
  id?: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  title?: string;
  content?: string;
}

// Store floating windows by ID
const floatingWindows = new Map<string, BrowserWindow>();

export function createFloatingWindow(options: FloatingWindowOptions = {}): BrowserWindow {
  const {
    id = `floating-${Date.now()}`,
    width = 300,
    height = 200,
    x,
    y,
    title = "Floating Window",
    content = "<h1>Floating Window</h1><p>Content here</p>"
  } = options;

  // Close existing window with same ID if exists
  if (floatingWindows.has(id)) {
    const existingWindow = floatingWindows.get(id);
    if (existingWindow && !existingWindow.isDestroyed()) {
      existingWindow.close();
    }
  }

  const window = new BrowserWindow({
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
      preload: join(__dirname, "../preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  // Load simple HTML content
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

  // Store window reference
  floatingWindows.set(id, window);

  // Clean up when closed
  window.on("closed", () => {
    floatingWindows.delete(id);
  });

  return window;
}

export function closeFloatingWindow(id: string): boolean {
  const window = floatingWindows.get(id);
  if (window && !window.isDestroyed()) {
    window.close();
    return true;
  }
  return false;
}

export function getFloatingWindow(id: string): BrowserWindow | undefined {
  return floatingWindows.get(id);
}

export function getAllFloatingWindows(): BrowserWindow[] {
  return Array.from(floatingWindows.values()).filter(w => !w.isDestroyed());
}
