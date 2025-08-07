# Implementation Plan (Hybrid: Electron + React Native)

This plan scaffolds an Electron desktop app and a React Native mobile app (with Expo Router), mirroring the Hybrid PRD. Focus is on shell structure and bridges; business logic lands later.

---

## 1) Desktop (Electron) Scaffolding

### 1.1 Directory Structure
```
hybrid/desktop/
  package.json
  electron-builder.yml (or electron-builder config in package.json)
  src/
    main/
      index.ts
      preload.ts
      tray.ts
      windows/
        mainWindow.ts
        floatingWindow.ts
      ipc/
        channels.ts
    renderer/
      index.html
      main.tsx
      App.tsx
      components/
        CommandPalette.tsx
      styles/
        index.css
      vite.config.ts
```

### 1.2 package.json (scripts & deps)
- Scripts: `dev` (concurrently run Vite and Electron), `build` (renderer + electron-builder), `package`.
- Deps: `electron`, `electron-builder`, `vite`, `react`, `react-dom`, `typescript`.
- DevDeps: `@vitejs/plugin-react`, `concurrently`, `esbuild`.

### 1.3 Main Process
- `main/index.ts`: app lifecycle (ready/quit), create main BrowserWindow, and register IPC handlers.
- Register protocol handler: `app.setAsDefaultProtocolClient('crochet-app-hybrid')` for deep links.
- `tray.ts`: create status tray with Show/Hide, About, Quit; forward tray clicks to toggle overlay.
- `windows/mainWindow.ts`: transparent, always-on-top, frameless window sized ~750x480; show/hide on hotkey.
- `windows/floatingWindow.ts`: factory to create small always-on-top windows; manage by id; forward events to renderer via `webContents.send`.
- Global Hotkey: register Alt+/ via `globalShortcut`.

### 1.4 Preload & IPC Bridge
- `preload.ts`: expose contextBridge APIs: `clipboard.read/write`, `files.read/write`, `windows.openFloating/closeFloating`, `deeplinks.open`.
- IPC channel definitions in `ipc/channels.ts`.
- Security: `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true` in BrowserWindow.

### 1.5 Renderer (Vite + React)
- `renderer/main.tsx`: bootstrap React.
- `App.tsx`: minimal shell with `CommandPalette` and simple page outlet.
- `CommandPalette.tsx`: placeholder; opens via message from main window.

### 1.6 Theming (Desktop)
- Use CSS variables for design tokens: `--canvas`, `--card`, `--content`, `--content-inverted`, `--primary`, `--primary-light`.
- Provide light/dark themes via a root `data-theme` attribute or `prefers-color-scheme` media query.
- Add a basic ThemeProvider in renderer to toggle theme and persist preference (localStorage).

---

## 2) Mobile (React Native with Expo Router) Scaffolding

### 2.1 Directory Structure
```
hybrid/mobile/
  app/                # Expo Router (file-based routing)
    _layout.tsx       # Root layout: ThemeProvider + Stack/Tabs
    index.tsx         # Palette screen
    placeholder.tsx   # Placeholder screen
  components/
    ThemeProvider.tsx
  package.json
  tsconfig.json
  babel.config.js
  app.json (or app.config.ts)
  metro.config.js
```

### 2.2 Bootstrap
- Use Expo + Expo Router.
- Install deps: `expo`, `expo-router`, `react-native-safe-area-context`, `react-native-screens`.
- Configure Babel: add `plugins: ['expo-router/babel']`.
- Entry point in `package.json`: `"main": "expo-router/entry"`.
- Configure deep link scheme in `app.json`:
  - `{
      "expo": {
        "scheme": "crochet-app-hybrid"
      }
    }`

### 2.3 App Shell (Expo Router)
- `app/_layout.tsx`: wrap routes with `ThemeProvider` and define `Stack`.
- `app/index.tsx`: minimal Palette screen.
- `app/placeholder.tsx`: secondary placeholder screen.
- Expo Router handles navigation via file-based routes.

### 2.4 Theming (Mobile)
- Use a simple theme object with tokens matching desktop (canvas/card/content/primary).
- Provide a `ThemeProvider` using React Context; persist preference with AsyncStorage.
- Respect system color scheme using `useColorScheme()` and allow user override.

---

## 3) Shared Models (TS)
- Create `hybrid/shared/` for TS types used by desktop renderer and RN app:
```
hybrid/shared/
  models.ts (Action, Page)
```

---

## 4) Chrome Extension (Minimal, MV3)

### 4.1 Directory Structure
```
hybrid/chrome-extension/
  manifest.json
  src/
    content.js (placeholder)
    service_worker.js (placeholder)
    popup/
      popup.html
      popup.js
      popup.css
  assets/
    icons/
      16.png
      48.png
      128.png
  README.md
```

### 4.2 Manifest (high-level)
- `manifest_version`: 3
- Basic `name`, `version`, `icons`
- `action`: popup
- Minimal `permissions`: `storage`

### 4.3 Placeholder Behavior
- Popup renders a simple UI with app name and a disabled "Install" button (for future wiring)
- Content script and service worker contain no-op listeners

### 4.4 Theming (Chrome Extension)
- Use CSS variables in `:root` and `[data-theme="dark"]` selectors.
- Provide a simple toggle in popup to switch themes and store in `chrome.storage`.

---

## 5) Cross-cutting Setup (Scaffold Only)
- URL handler test stubs: desktop and mobile accept `crochet-app-hybrid://...` (log only)
- Global hotkey test on desktop: toggles overlay window visibility
- Basic theming scaffolding implemented across desktop, mobile, and extension

---

## 6) Next Steps After Scaffolding (Defer Implementation)
- Wire data and integrations later (e.g., Firestore, crawler, real-time)
- Add action/page models to actual UI flows
- Implement extension runtime and installation pipeline in subsequent phases
