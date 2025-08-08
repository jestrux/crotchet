import { app, Menu, Tray, BrowserWindow } from "electron";
import { join, dirname } from "node:path";

const __dirname = __filename ? dirname(__filename) : process.cwd();

export type TrayHandle = Tray;

export function createTray(mainWindow: BrowserWindow | null): TrayHandle {
  // Create tray icon (using a simple placeholder for now)
  const tray = new Tray(join(__dirname, "tray-icon.png"));
  
  // Create context menu
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show",
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    {
      label: "Hide", 
      click: () => {
        if (mainWindow) {
          mainWindow.hide();
        }
      },
    },
    {
      type: "separator",
    },
    {
      label: "About Crotchet",
      click: () => {
        // TODO: Show about dialog
        console.log("About Crotchet");
      },
    },
    {
      type: "separator", 
    },
    {
      label: "Quit",
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip("Crotchet - Command Palette");

  return tray;
}
