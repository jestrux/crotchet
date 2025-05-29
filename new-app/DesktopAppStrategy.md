# Desktop App Strategy

## Overview
A native-feeling macOS application built with Electron and TypeScript, featuring a command bar interface similar to Spotlight/Raycast. The app will use web technologies throughout, with a focus on performance and native-like experience.

## Core Architecture

### Main Process (Electron)
- Application lifecycle management
- Window management
- Global shortcuts
- Menubar integration
- Native macOS integration
- IPC communication
- Extension management
- Preference system for theme and settings

### Renderer Process (TypeScript/React)
- Command bar implementation
- Page system and routing
- UI components
- State management
- Extension rendering
- Hot reloading support

### Extension Layer (TypeScript)
- TypeScript SDK for extension development
- Extension manifest system
- Page registration and management
- Command registration
- State access and modification

### Preference System
- Electron's `electron-store` for persistent storage
- Theme preferences:
  ```typescript
  interface ThemePreferences {
    colorScheme: 'light' | 'dark' | 'system';
    tintColor?: string;
    customColors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
    };
  }
  ```
- Preference management:
  - Load preferences on app start
  - Save preferences on changes
  - Sync preferences across windows
  - Default fallback values
  - Migration handling for preference updates

### Storage System
- JSON file-based storage (`~/.crotchet/storage.json`)
- Simple key-value storage with type safety
- Automatic file creation and backup
- In-memory cache for performance

### Main Process API
```typescript
// Main Process (preload.js)
import { contextBridge, exposeInMainWorld } from 'electron';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';

const STORAGE_PATH = join(homedir(), '.crotchet', 'storage.json');
let storageCache: Record<string, any> = {};

// Initialize storage
async function initStorage() {
  try {
    const data = await readFile(STORAGE_PATH, 'utf-8');
    storageCache = JSON.parse(data);
  } catch {
    // Create storage file if it doesn't exist
    await writeFile(STORAGE_PATH, '{}');
  }
}

// Save storage to file
async function saveStorage() {
  await writeFile(STORAGE_PATH, JSON.stringify(storageCache, null, 2));
}

// Expose Electron API
exposeInMainWorld('electronAPI', {
  // Storage
  getPreference: async (key: string, defaultValue?: any) => {
    return storageCache[key] ?? defaultValue;
  },
  setPreference: async (key: string, value: any) => {
    storageCache[key] = value;
    await saveStorage();
    mainWindow.webContents.send('storage:updated', key, value);
  },
  removePreference: async (key: string) => {
    delete storageCache[key];
    await saveStorage();
    mainWindow.webContents.send('storage:updated', key, null);
  },
  getPreferences: async (keys: string[]) => {
    return keys.reduce((acc, key) => {
      acc[key] = storageCache[key];
      return acc;
    }, {} as Record<string, any>);
  },
  setPreferences: async (preferences: Record<string, any>) => {
    Object.assign(storageCache, preferences);
    await saveStorage();
    Object.entries(preferences).forEach(([key, value]) => {
      mainWindow.webContents.send('storage:updated', key, value);
    });
  },
  removePreferences: async (keys: string[]) => {
    keys.forEach(key => delete storageCache[key]);
    await saveStorage();
    keys.forEach(key => {
      mainWindow.webContents.send('storage:updated', key, null);
    });
  },
  getAllPreferences: async () => {
    return { ...storageCache };
  },
  clearPreferences: async () => {
    storageCache = {};
    await saveStorage();
    mainWindow.webContents.send('storage:cleared');
  },

  // Window
  showWindow: () => {
    mainWindow.show();
  },
  hideWindow: () => {
    mainWindow.hide();
  },

  // System
  readFile: async (props: FileProps) => {
    // Implementation
  },
  writeFile: async (props: FileProps, contents: any) => {
    // Implementation
  },
  getFile: async (props: FileProps) => {
    // Implementation
  },
  copyToClipboard: (content: string, message?: string) => {
    // Implementation
  },
  readClipboard: async () => {
    // Implementation
  },
  showToast: (message: string) => {
    // Implementation
  },
  share: (data: any) => {
    // Implementation
  }
});
```

### Renderer Process Usage
```typescript
// Renderer Process
interface Window {
  electronAPI: {
    // Storage
    getPreference<T>(key: string, defaultValue?: T): Promise<T>;
    setPreference<T>(key: string, value: T): Promise<void>;
    removePreference(key: string): Promise<void>;
    getPreferences<T extends Record<string, any>>(keys: string[]): Promise<T>;
    setPreferences(preferences: Record<string, any>): Promise<void>;
    removePreferences(keys: string[]): Promise<void>;
    getAllPreferences(): Promise<Record<string, any>>;
    clearPreferences(): Promise<void>;

    // Window
    showWindow(): void;
    hideWindow(): void;

    // System
    readFile(props: FileProps): Promise<any>;
    writeFile(props: FileProps, contents: any): Promise<void>;
    getFile(props: FileProps): Promise<File>;
    copyToClipboard(content: string, message?: string): void;
    readClipboard(): Promise<string>;
    showToast(message: string): void;
    share(data: any): void;
  };
}

// Usage examples
async function updateTheme() {
  const currentTheme = await window.electronAPI.getPreference('theme');
  await window.electronAPI.setPreference('theme', {
    ...currentTheme,
    colorScheme: 'dark'
  });
}

async function updateMultipleSettings() {
  await window.electronAPI.setPreferences({
    'theme.colorScheme': 'dark',
    'window.size': { width: 750, height: 480 },
    'shortcuts.enabled': true
  });
}

function toggleWindow() {
  window.electronAPI.showWindow();
}

async function copyToClipboard() {
  await window.electronAPI.copyToClipboard('Hello World', 'Copied!');
}

// Event handling
window.addEventListener('storage:updated', (event: CustomEvent) => {
  const { key, value } = event.detail;
  // Handle storage update
});

window.addEventListener('storage:cleared', () => {
  // Handle storage clear
});
```

### Benefits of Unified API
1. **Organization**: All Electron functionality under one namespace
2. **Clarity**: Clear separation of concerns
3. **Type Safety**: Better TypeScript integration
4. **Maintainability**: Easier to manage and extend
5. **Documentation**: Simpler to document and understand

### Theme Integration
- Load saved theme on app start
- Apply theme changes immediately
- Persist theme changes automatically
- Handle system theme changes
- Theme transition animations
- Theme-aware components

## Window Specifications

### Window Management
- **Size**: Fixed at 750x480 pixels
- **Style**: Frameless window with transparent background
- **Visibility**: Hidden from dock/taskbar
- **Position**: Centered on screen
- **Global Shortcut**: Register global shortcut for showing/hiding window
- **Background**: Semi-transparent dark background in web app

## Page System

### Page Types
1. **Search Page**
   - Default page type
   - Supports list and grid layouts
   - Fuzzy search capabilities
   - Real-time filtering
   - Keyboard navigation

2. **Detail Page**
   - Item-specific information display
   - Rich content support
   - Action buttons
   - Related items

3. **Form Page**
   - Data input and validation
   - Dynamic form fields
   - Form state management
   - Submission handling

### Page Interface
```typescript
interface Page {
    id: string;
    title: string;
    type: PageType;
    layout: LayoutType;
    load(): Promise<void>;
    unload(): Promise<void>;
}
```

## Command Bar

### Features
- Global keyboard shortcut (⌥ + /)
- Fuzzy search across all commands
- Command history
- Quick actions
- Extension command integration

### Command Types
1. **Native Commands**
   - System actions
   - App navigation
   - Settings management

2. **Extension Commands**
   - Custom actions
   - Page navigation
   - Data manipulation

## Extension System

### Extension Structure
```typescript
interface Extension {
    id: string;
    name: string;
    version: string;
    pages: Page[];
    commands: Command[];
    init(): Promise<void>;
}
```

### Extension API
- Page registration
- Command registration
- State management
- Event handling
- Native feature access

## Development Workflow

### Live Reload System

#### App Process (Renderer)
```typescript
// webpack.config.js
module.exports = {
  mode: 'development',
  devServer: {
    hot: true,
    liveReload: true,
    watchFiles: ['src/**/*'],
    client: {
      overlay: true,
      progress: true,
    },
    // Enable WebSocket connection for HMR
    webSocketServer: 'ws',
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new ReactRefreshPlugin(),
  ],
};

// vite.config.ts (Alternative)
export default defineConfig({
  server: {
    hmr: {
      overlay: true,
    },
    watch: {
      usePolling: true,
    },
  },
  plugins: [
    react({
      fastRefresh: true,
    }),
  ],
});
```

#### Electron Process (Main)
```typescript
// main.ts
import { app, BrowserWindow } from 'electron';
import { watch } from 'fs';
import { join } from 'path';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: join(__dirname, 'preload.js'),
    },
  });

  // Load app in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile('index.html');
  }
}

// Watch main process files
if (process.env.NODE_ENV === 'development') {
  const mainProcessPath = join(__dirname, 'main');
  
  watch(mainProcessPath, { recursive: true }, (eventType, filename) => {
    if (filename) {
      console.log(`File ${filename} changed. Restarting...`);
      app.relaunch();
      app.exit(0);
    }
  });
}

app.whenReady().then(createWindow);
```

#### Development Scripts
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:app\" \"wait-on tcp:5180 && npm run dev:electron\"",
    "dev:app": "vite --port 5180",
    "dev:electron": "tsc -w & electron .",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

#### Development Features
1. **App Process (Renderer)**
   - Hot Module Replacement (HMR)
   - Fast Refresh for React components
   - Source map support
   - Error overlay
   - WebSocket-based live reload
   - File watching with polling
   - Development server with proxy support
   - Fixed port (5180) for consistent development

2. **Electron Process (Main)**
   - File watching for main process
   - Automatic process restart
   - DevTools integration
   - Source map support
   - Error handling and logging
   - Development environment detection
   - Waits for Vite server to be ready

#### Development Environment Variables
```env
# .env.development
NODE_ENV=development
VITE_PORT=5180
ELECTRON_START_URL=http://localhost:5180
ELECTRON_ENABLE_LOGGING=true
ELECTRON_ENABLE_STACK_TRACES=true
```

#### Main Process Development
```typescript
// main.ts
import { app, BrowserWindow } from 'electron';
import { watch } from 'fs';
import { join } from 'path';

const VITE_PORT = process.env.VITE_PORT || 5180;
const VITE_URL = `http://localhost:${VITE_PORT}`;

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: join(__dirname, 'preload.js'),
    },
  });

  // Load app in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL(VITE_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile('index.html');
  }
}

// Watch main process files
if (process.env.NODE_ENV === 'development') {
  const mainProcessPath = join(__dirname, 'main');
  
  watch(mainProcessPath, { recursive: true }, (eventType, filename) => {
    if (filename) {
      console.log(`File ${filename} changed. Restarting...`);
      app.relaunch();
      app.exit(0);
    }
  });
}

app.whenReady().then(createWindow);
```

#### Development Dependencies
```json
{
  "devDependencies": {
    "concurrently": "^8.0.0",
    "wait-on": "^7.0.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0",
    "electron": "^28.0.0"
  }
}
```

#### Development Workflow
1. Start Vite development server on port 5180
2. Wait for port 5180 to be available
3. Launch Electron in development mode
4. Enable file watching
5. Configure HMR
6. Set up debugging
7. Monitor process logs
8. Handle hot reloads
9. Manage state persistence

## Data Flow

### State Management
- Centralized state in renderer process
- Extension state access through IPC
- Real-time updates via pub/sub
- State persistence

### Communication
- IPC-based communication
- Type-safe message passing
- Error handling
- State synchronization

## Security Considerations
*Note: For local development, security measures are minimal*

### Future Security Features
- Extension sandboxing
- Permission system
- Resource access control
- Code signing

## Implementation Phases

### Phase 1: Core System
- Basic command bar
- Page system implementation
- Window management
- Menubar integration
- Theming system implementation

## Theming System

### Core Features
- CSS Variables for consistent theming
- Dark/Light mode support
- System theme detection
- Theme persistence
- Custom theme colors
- Smooth theme transitions
- Color manipulation utilities

### Color Utilities
```typescript
interface ColorUtils {
  // Color manipulation
  tinyColor(color: string): {
    toRgb(): { r: number; g: number; b: number };
    isLight(): boolean;
    darken(amount: number): ColorUtils;
    lighten(amount: number): ColorUtils;
  };
  
  // Color scheme detection
  getSystemColorScheme(): 'light' | 'dark';
  onSystemColorSchemeChange(callback: (scheme: 'light' | 'dark') => void): void;
}
```

### Theme Management
```typescript
interface ThemeManager {
  // Theme state
  getThemeProps(theme: Partial<ThemePreferences>): ThemeProps;
  applyTheme(theme: ThemeProps): void;
  
  // Color calculations
  calculatePrimaryColors(primary: string): {
    primary: string;
    onPrimary: string;
    onPrimaryInverted: string;
  };
  
  // System integration
  handleSystemThemeChange(isDark: boolean): void;
  updateColorScheme(scheme: 'light' | 'dark' | 'system'): void;
}
```

### Theme Variables
```css
:root {
    /* Base colors */
    --canvas-color: rgb(240, 240, 240);
    --card-color: rgb(255, 255, 255);
    --stroke-color: rgb(226, 232, 240);
    --content-color: rgb(0, 0, 0);
    --content-inverted-color: rgb(255, 255, 255);
    
    /* Primary colors */
    --primary-color: rgb(var(--primary-color));
    --on-primary-color: rgb(var(--on-primary-color));
    --on-primary-inverted-color: rgb(var(--on-primary-inverted-color));
    
    /* Overlay */
    --overlay-color: rgba(0, 0, 0, 0.035);
}

.dark {
    --canvas-color: rgb(0, 0, 0);
    --card-color: rgb(37, 37, 37);
    --stroke-color: rgb(53, 53, 53);
    --content-color: rgb(255, 255, 255);
    --content-inverted-color: rgb(0, 0, 0);
    --overlay-color: rgba(0, 0, 0, 0.2);
}
```

### Theme Integration
- Load saved theme on app start
- Apply theme changes immediately
- Persist theme changes automatically
- Handle system theme changes
- Theme transition animations
- Theme-aware components
- Dynamic color calculations
- System preference synchronization

### Theme Hooks
```typescript
// Theme initialization
function useInitAppTheme() {
  // Load saved theme
  // Set up system theme listener
  // Initialize theme state
}

// Theme access
function useAppTheme() {
  // Access current theme
  // Subscribe to theme changes
  // Provide theme utilities
}

// Theme styles
function useThemeStyles() {
  // Generate dynamic styles
  // Handle color calculations
  // Manage CSS variables
}
```

### Theme Events
- `theme-changed`: When theme is updated
- `system-theme-changed`: When system theme changes
- `theme-preferences-updated`: When preferences are saved
- `theme-initialized`: When theme is first loaded

### Integration
- Tailwind CSS integration
- Component-level theming
- Dynamic theme updates
- Theme-aware components

### Phase 2: Extension System
- TypeScript SDK
- Extension loading
- Page registration
- Command registration
- Development tools

### Phase 3: Native Features
- macOS integration
- System commands
- File system access
- Native UI components

### Phase 4: Polish
- Performance optimization
- UI/UX improvements
- Documentation
- Example extensions

## Technical Requirements

### Main App
- Electron
- TypeScript
- React
- Node.js
- macOS 12.0+

### Extensions
- TypeScript
- Node.js (development)
- Web technologies (HTML/CSS/JS)

## Development Tools
- VS Code
- TypeScript compiler
- Electron Forge
- Development server
- Debugging tools

## Performance Optimizations
- Single window instance
- Lazy loading of extensions
- Efficient IPC communication
- Memory management
- Startup time optimization
- Window show/hide performance

## Styling System

### Tailwind Integration
- Tailwind CDN for dynamic class generation
- No build-time CSS generation
- Support for all Tailwind classes in extensions
- Custom theme variables integration
- Dark/Light mode support

### Theme Variables
```css
:root {
    --canvas-color: rgb(240, 240, 240);
    --card-color: rgb(255, 255, 255);
    --stroke-color: rgb(226, 232, 240);
    --content-color: rgb(0, 0, 0);
    --content-inverted-color: rgb(255, 255, 255);
    --primary-color: rgb(102, 51, 153);
    --on-primary-color: rgb(255, 255, 255);
    --on-primary-inverted-color: rgb(0, 0, 0);
}

.dark {
    --canvas-color: rgb(0, 0, 0);
    --card-color: rgb(37, 37, 37);
    --stroke-color: rgb(53, 53, 53);
    --content-color: rgb(255, 255, 255);
    --content-inverted-color: rgb(0, 0, 0);
    --primary-color: rgb(176, 112, 241);
    --on-primary-color: rgb(0, 0, 0);
    --on-primary-inverted-color: rgb(255, 255, 255);
}
```

### Tailwind Configuration
```javascript
window.tailwind.config = {
    theme: {
        extend: {
            colors: {
                canvas: `rgb(var(--canvas-color) / <alpha-value>)`,
                card: `rgb(var(--card-color) / <alpha-value>)`,
                content: `rgb(var(--content-color) / <alpha-value>)`,
                inverted: `rgb(var(--content-inverted-color) / <alpha-value>)`,
                "on-content": `rgb(var(--content-inverted-color) / <alpha-value>)`,
                primary: `rgb(var(--primary-color) / <alpha-value>)`,
                "on-primary": `rgb(var(--on-primary-color) / <alpha-value>)`,
                "on-primary-inverted": `rgb(var(--on-primary-inverted-color) / <alpha-value>)`,
                stroke: `rgb(var(--stroke-color) / <alpha-value>)`,
            },
        },
    },
};
```

### Benefits
- No need to rebuild CSS for new classes
- Extensions can use any Tailwind class
- Dynamic theme switching
- Smaller bundle size
- Faster development cycle
- Consistent styling across app and extensions 

## App Structure

### Core Components
1. **DesktopApp**
   - Root component
   - Window management
   - Toast notifications
   - Platform utilities registration
   - Floating window support

2. **AppContent**
   - Page stack management
   - Command handling
   - Favorites system
   - Data source integration

3. **ThemeBg**
   - Theme-aware background
   - Overlay support
   - Tint color integration

### Page System

#### Page Types
1. **Search Page**
   - Command search
   - Data source browsing
   - Favorites management
   - Action execution

2. **Detail Page**
   - Item information display
   - Action buttons
   - Related items

3. **Form Page**
   - Data input
   - Validation
   - Submission handling

#### Page Context
```typescript
interface PageContext {
  // Page state
  isOpen: boolean;
  page: Page;
  pageData: any;
  pageStatus: {
    status: 'idle' | 'loading' | 'success' | 'error';
    message?: string;
  };
  
  // Form handling
  formData: any;
  setFormData: (data: any) => void;
  
  // Page actions
  mainAction: Action;
  secondaryAction: Action;
  actions: Action[];
  
  // Event handlers
  onOpen: () => void;
  onClose: (data?: any) => void;
  onCommandMatched: () => void;
  onBlur: () => void;
  onReady: () => void;
  onDataUpdated: () => void;
  onEscape: () => void;
  
  // Navigation
  onNavigateDown: () => void;
  onNavigateUp: () => void;
}
```

### Command System

#### Command Structure
```typescript
interface Command {
  name: string;
  label: string;
  value: string;
  trailing?: string;
  action: {
    label: string;
    handler: () => void;
  };
  section?: string;
  pinned?: number;
  actions?: Action[];
}
```

#### Command Management
- Favorites system
- Command pinning
- Section organization
- Action integration
- Global commands
- Data source commands

### Floating Windows

#### Window Types
1. **Main Window**
   - Command bar interface
   - Page stack
   - Theme integration
   - Toast notifications

2. **Floating Windows**
   - Independent instances
   - Custom content
   - Event isolation
   - Window management

#### Window Management
```typescript
interface WindowManager {
  // Window state
  isVisible: boolean;
  isFloating: boolean;
  
  // Window actions
  show: () => void;
  hide: () => void;
  focus: () => void;
  
  // Event handling
  onFocus: () => void;
  onBlur: () => void;
  onClose: () => void;
}
```

### Event System

#### Event Types
1. **Page Events**
   - `open-page`
   - `close-page`
   - `page-data-updated`
   - `page-status-changed`

2. **Command Events**
   - `command-matched`
   - `command-executed`
   - `favorites-updated`

3. **Window Events**
   - `window-focus`
   - `window-blur`
   - `window-close`

4. **Theme Events**
   - `theme-changed`
   - `system-theme-changed`

#### Event Handling
```typescript
interface EventSystem {
  // Event registration
  on: (event: string, handler: Function) => void;
  off: (event: string, handler: Function) => void;
  
  // Event dispatch
  emit: (event: string, payload?: any) => void;
  
  // Event filtering
  filter: (event: string, condition: Function) => void;
}
```

### Platform Integration

#### Native Features
1. **File System**
   - File reading
   - File writing
   - Directory access
   - File watching

2. **Clipboard**
   - Copy to clipboard
   - Read from clipboard
   - Clipboard monitoring

3. **System Integration**
   - Toast notifications
   - Window management
   - Global shortcuts
   - System theme detection

#### Platform Utilities
```typescript
interface PlatformUtils {
  // File operations
  readFile: (props: FileProps) => Promise<any>;
  writeFile: (props: FileProps, contents: any) => Promise<void>;
  getFile: (props: FileProps) => Promise<File>;
  
  // Clipboard
  copyToClipboard: (content: string, message?: string) => void;
  readClipboard: () => Promise<string>;
  
  // System
  showToast: (message: string) => void;
  share: (data: any) => void;
}
```

### PageProvider API

#### Core Interface
```typescript
interface PageProvider {
  // Page State
  isOpen: boolean;
  page: Page;
  pageData: any;
  pageDataVersion: string;
  pageResolving: boolean;
  pageStatus: {
    status: 'idle' | 'loading' | 'success' | 'error';
    message?: string;
  };
  
  // Form State
  formData: any;
  setFormData: (data: any) => void;
  
  // Page Content
  title: () => string;
  content: () => any;
  preview: () => any;
  setPreview: (preview: any) => void;
  
  // Navigation
  pageFilter: string;
  setPageFilter: (filter: string) => void;
  filters: () => any[];
  pageTab: string;
  setPageTab: (tab: string) => void;
  tabs: () => any[];
  
  // Actions
  mainAction: () => Action;
  setMainAction: (action: Action) => void;
  secondaryAction: () => Action;
  setSecondaryAction: (action: Action) => void;
  actions: () => Action[];
  setActions: (actions: Action[]) => void;
  
  // Event Handlers
  onOpen: (callback: () => void) => void;
  onClose: (callback: (data?: any) => void) => void;
  onReady: (callback: (data: any) => void) => void;
  onDataUpdated: (callback: (data: any, oldData: any) => void) => void;
  onEscape: (callback: (payload?: any) => void) => void;
  onClick: (callback: () => void) => void;
  onMainActionClick: (callback: () => void) => void;
  onSecondaryActionClick: (callback: () => void) => void;
  onOpenActionMenu: (callback: () => void) => void;
  onChangeFilter: (callback: () => void) => void;
  onFilterChanged: (callback: () => void) => void;
  onNavigateDown: (callback: () => void) => void;
  onNavigateUp: (callback: () => void) => void;
}

interface Action {
  label: string;
  shortcut?: string;
  icon?: string;
  handler: () => void;
  priority?: number;
  type?: 'primary' | 'secondary';
  remote?: boolean;
}

interface Page {
  _id: string;
  type: 'search' | 'detail' | 'form';
  title: string | ((context: PageContext) => string);
  content: any | ((context: PageContext) => any);
  preview?: any | ((context: PageContext) => any);
  icon?: string | ((context: PageContext) => string);
  filter?: {
    field: string;
    defaultValue?: string;
  };
  filters?: any[] | ((context: PageContext) => any[]);
  tabs?: any[] | ((context: PageContext) => any[]);
  toolbar?: any | ((context: PageContext) => any);
  fields?: any | ((context: PageContext) => any);
  field?: any | ((context: PageContext) => any);
  action?: Action | ((context: PageContext) => Action);
  secondaryAction?: Action | ((context: PageContext) => Action);
  actions?: Action[] | ((context: PageContext) => Action[]);
  appActions?: Action[] | ((context: PageContext) => Action[]);
  resolve?: (props: { fromRefetch?: boolean; filters?: any }) => Promise<any>;
  onDataChange?: (callback: () => void) => () => void;
  listenForUpdates?: string | string[];
  fullScreen?: boolean;
  noPadding?: boolean;
}

interface PageContext {
  page: Page;
  pageData: any;
  pageDataVersion: string;
  formData: any;
  pageFilter: string;
  closePage: (payload?: any) => void;
}
```

#### Event System
```typescript
// Page Events
'click-${pageId}'           // Trigger page click handler
'open-${pageId}'           // Trigger page open handler
'blur-${pageId}'           // Trigger page blur handler
'command-matched-${pageId}' // Trigger command matched handler
'escape-${pageId}'         // Trigger escape handler
'menu-closed-${pageId}'    // Trigger menu closed handler
'alert-closed-${pageId}'   // Trigger alert closed handler
'change-filter-${pageId}'  // Trigger filter change handler
'filter-changed-${pageId}' // Trigger filter changed handler
'action-menu-${pageId}'    // Trigger action menu handler
'secondary-action-${pageId}' // Trigger secondary action handler
'enter-click-${pageId}'    // Trigger enter click handler
'cmd-enter-click-${pageId}' // Trigger cmd+enter click handler
'navigate-down-${pageId}'  // Trigger navigate down handler
'navigate-up-${pageId}'    // Trigger navigate up handler
'status-change-${pageId}'  // Update page status
```

#### Usage Example
```typescript
// Create a new page
const page = {
  _id: 'search-page',
  type: 'search',
  title: 'Search',
  content: ({ pageData }) => <SearchResults data={pageData} />,
  filter: {
    field: 'query',
    defaultValue: ''
  },
  resolve: async ({ filters }) => {
    return await searchItems(filters?.query);
  },
  actions: [
    {
      label: 'Search',
      shortcut: 'Enter',
      handler: () => { /* ... */ }
    }
  ]
};

// Use PageProvider
<PageProvider 
  isOpen={true}
  page={page}
  onClose={(data) => {
    // Handle page close
  }}
>
  <PageContent />
</PageProvider>

// Use page context
function PageContent() {
  const {
    pageData,
    pageFilter,
    setPageFilter,
    mainAction,
    onMainActionClick
  } = usePageContext();

  // Use page context values and methods
}
``` 