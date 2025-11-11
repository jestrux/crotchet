# Extension System Architecture

## Overview

A cross-platform extension system for desktop (Electron) and mobile (Expo) that allows single-file, self-registering extensions with hot-reload capabilities.

## Core Concepts

### Extension Types

```
extensions/
├── core/       # Bundled with app, read-only, always enabled
├── dev/        # Development extensions with hot reload
├── local/      # User-created extensions in-app
└── external/   # Installed from GitHub Gists or URLs
```

### Extension File Format

Extensions are single TypeScript/JavaScript files with metadata in comments:

```typescript
// @name Spotify Integration
// @scheme spotify
// @description Spotify integration for music control
// @author Walter
// @version 1.0.0
// @tags music, streaming

export default {
  install(context) {
    const { registerAction, registerWidget } = context;

    registerAction('randomTrack', {
      label: 'Random Track',
      icon: spotifyIcon,
      global: true,
      handler: async () => {
        await openPage({
          type: 'preview',
          resolve: async () => fetchRandomTrack()
        });
      }
    });

    registerWidget('nowPlaying', {
      label: 'Now Playing',
      resolve: async () => getCurrentTrack(),
      onClick: ({ data }) => openTrack(data)
    });
  }
}
```

## Identity System

### Hash-Based IDs

Each extension gets a unique ID generated from its content hash:

```typescript
import crypto from 'crypto';

function generateExtensionId(fileContents: string): string {
  const hash = crypto
    .createHash('sha256')
    .update(fileContents)
    .digest('hex');

  return `ext_${hash.substring(0, 12)}`;
}

// Example: "ext_a7f3b2c1d8e9"
```

### Human-Readable Schemes

Extensions provide a `@scheme` for readable URLs:

```typescript
// @scheme spotify

// Results in URLs like:
// crotchet://actions/spotify/randomTrack
// crotchet://widgets/spotify/nowPlaying
```

If no scheme is provided, it's auto-generated from the extension name:
```typescript
// @name Clipboard Utils
// Generated scheme: "clipboard-utils"
```

### Scheme Conflict Detection

During installation, the system checks if a scheme is already taken:

```typescript
const existingExtension = await getExtensionByScheme(scheme);
if (existingExtension && existingExtension.id !== extensionId) {
  throw new Error(`Scheme "${scheme}" already taken by: ${existingExtension.metadata.name}`);
}
```

## Registry System

### File Structure

```
app-data/
├── extensions/
│   ├── core/           # Bundled extensions
│   ├── dev/            # Development extensions
│   ├── local/          # User-created
│   └── external/       # Installed from gists
│
└── registry/
    ├── extensions.json # Extension metadata
    └── manifest.json   # What's registered by whom
```

### Extension Metadata (extensions.json)

```json
{
  "extensions": {
    "ext_a7f3b2c1d8e9": {
      "id": "ext_a7f3b2c1d8e9",
      "scheme": "spotify",
      "type": "external",
      "enabled": true,
      "metadata": {
        "name": "Spotify Integration",
        "version": "1.0.0",
        "author": "Walter",
        "description": "Spotify integration",
        "tags": ["music", "streaming"]
      },
      "contentHash": "a7f3b2c1d8e9...",
      "source": {
        "type": "gist",
        "url": "https://gist.github.com/user/abc123",
        "installedAt": "2024-01-01T00:00:00Z",
        "lastChecked": "2024-01-15T00:00:00Z"
      },
      "filePath": "extensions/external/spotify.ts"
    }
  },

  "schemes": {
    "spotify": "ext_a7f3b2c1d8e9",
    "clipboard": "ext_f3d8a2b1c9e7"
  }
}
```

### Registry Manifest (manifest.json)

Tracks what each extension registered:

```json
{
  "actions": {
    "spotify/randomTrack": {
      "extensionId": "ext_a7f3b2c1d8e9",
      "scheme": "spotify",
      "name": "randomTrack",
      "fullPath": "crotchet://actions/spotify/randomTrack",
      "config": {
        "label": "Random Track",
        "icon": "...",
        "global": true
      }
    }
  },

  "widgets": {
    "spotify/nowPlaying": {
      "extensionId": "ext_a7f3b2c1d8e9",
      "scheme": "spotify",
      "name": "nowPlaying",
      "config": { /* ... */ }
    }
  },

  "sections": {},
  "pages": {}
}
```

## Installation Flow

### Install Function Pattern

Like Vue/Alpine plugins, extensions export an `install` function that runs once:

```typescript
async function installExtension(filePath: string, type: ExtensionType) {
  // 1. Read file contents
  const fileContents = await readFile(filePath, 'utf-8');

  // 2. Parse metadata (generates ID from contents)
  const metadata = parseExtensionMetadata(fileContents);
  const extensionId = metadata.id;
  const scheme = metadata.scheme;

  // 3. Check scheme conflicts
  const existingExtension = await getExtensionByScheme(scheme);
  if (existingExtension && existingExtension.id !== extensionId) {
    throw new Error(`Scheme "${scheme}" already taken`);
  }

  // 4. Save extension metadata
  await saveExtensionMetadata(extensionId, {
    id: extensionId,
    scheme,
    type,
    enabled: true,
    metadata,
    contentHash: metadata.id.replace('ext_', ''),
    filePath
  });

  // 5. Register scheme mapping
  await registerScheme(scheme, extensionId);

  // 6. Run install with context
  const extension = await import(filePath);
  extension.default.install(createContext(extensionId, scheme));

  // 7. Save manifest
  await saveManifest();

  return { extensionId, scheme };
}
```

### Context Injection

Extensions receive a context object with platform APIs:

```typescript
function createContext(extensionId: string, scheme: string) {
  return {
    registerAction(name: string, config: any) {
      const fullPath = `crotchet://actions/${scheme}/${name}`;

      registry.actions[`${scheme}/${name}`] = {
        extensionId,
        scheme,
        name,
        fullPath,
        config
      };

      console.log(`✓ Registered action: ${fullPath}`);
    },

    registerWidget(name: string, config: any) {
      registry.widgets[`${scheme}/${name}`] = {
        extensionId,
        scheme,
        name,
        config
      };
    },

    registerSection(name: string, config: any) {
      registry.sections[`${scheme}/${name}`] = {
        extensionId,
        scheme,
        name,
        config
      };
    },

    registerPage(name: string, config: any) {
      registry.pages[`${scheme}/${name}`] = {
        extensionId,
        scheme,
        name,
        config
      };
    },

    // Platform APIs (same interface, different implementations)
    dispatch,
    listen,
    openPage,
    closePage,
    showToast,
    openUrl,
    savePreference,
    getPreference,
    // ... more APIs
  };
}
```

## App Startup Flow

On app startup, load extensions without re-running install:

```typescript
async function loadExtensions() {
  // 1. Load saved registry manifest
  const manifest = await loadManifest();

  // 2. Load extension metadata
  const extensionsMetadata = await loadExtensionsMetadata();

  // 3. For each enabled extension, load and install
  for (const [id, meta] of Object.entries(extensionsMetadata.extensions)) {
    if (!meta.enabled) continue;

    // Load extension code
    const extension = await import(meta.filePath);

    // Re-run install to get handlers in memory
    extension.default.install(createContext(id, meta.scheme));
  }

  // 4. Registry now has all actions/widgets with live handlers
  dispatch('extensions-loaded');
}
```

## Uninstallation

Remove extension and all its registrations:

```typescript
async function uninstallExtension(extensionId: string) {
  const extension = await getExtensionMetadata(extensionId);
  const scheme = extension.scheme;

  // 1. Remove all registered items by extensionId
  for (const key of Object.keys(registry.actions)) {
    if (registry.actions[key].extensionId === extensionId) {
      delete registry.actions[key];
    }
  }

  for (const key of Object.keys(registry.widgets)) {
    if (registry.widgets[key].extensionId === extensionId) {
      delete registry.widgets[key];
    }
  }

  // 2. Unregister scheme
  await unregisterScheme(scheme);

  // 3. Delete extension metadata
  await deleteExtensionMetadata(extensionId);

  // 4. Delete file (if not core)
  if (extension.type !== 'core') {
    await deleteFile(extension.filePath);
  }

  await saveManifest();

  console.log(`🗑️ Uninstalled: ${extension.metadata.name} (${scheme})`);
}
```

## Dev Mode Extensions

### Configuration

```json
{
  "devMode": true,
  "devExtensionsPaths": [
    "/Users/waky/projects/my-extensions",
    "/Users/waky/.crotchet/extensions/dev"
  ],
  "hotReload": true,
  "showDevBadges": true,
  "devServerUrl": "http://192.168.1.100:3456" // Mobile only
}
```

### Desktop Hot Reload

```typescript
// Using chokidar for file watching
function watchDevExtensions() {
  if (!config.devMode || !config.hotReload) return;

  const watcher = chokidar.watch(config.devExtensionsPaths, {
    ignored: /node_modules|\.git/,
    persistent: true
  });

  watcher.on('change', async (filePath) => {
    console.log(`🔄 Dev extension changed: ${filePath}`);

    // Find extension ID
    const extensionId = await getExtensionIdFromPath(filePath);

    // Uninstall old version
    await uninstallExtension(extensionId, { keepMetadata: true });

    // Clear module cache
    delete require.cache[require.resolve(filePath)];

    // Reinstall
    await installExtension(filePath, 'dev');

    dispatch('extension-reloaded', { extensionId });
  });

  watcher.on('add', async (filePath) => {
    console.log(`➕ New dev extension: ${filePath}`);
    await installExtension(filePath, 'dev');
  });

  watcher.on('unlink', async (filePath) => {
    console.log(`🗑️ Dev extension deleted: ${filePath}`);
    const extensionId = await getExtensionIdFromPath(filePath);
    await uninstallExtension(extensionId);
  });
}
```

### Mobile Dev Server

For mobile, run a dev server on your computer that the app connects to:

#### Dev Server (runs on computer)

```typescript
// dev-server/index.js
const express = require('express');
const chokidar = require('chokidar');
const WebSocket = require('ws');
const fs = require('fs');

const app = express();
const PORT = 3456;

// WebSocket for live updates
const wss = new WebSocket.Server({ port: 3457 });
const clients = new Set();

wss.on('connection', (ws) => {
  console.log('📱 Mobile device connected');
  clients.add(ws);

  ws.on('close', () => {
    clients.delete(ws);
  });
});

// Serve extensions
app.use('/extensions', express.static('./extensions/dev'));

// API: List all extensions
app.get('/api/extensions', (req, res) => {
  const files = fs.readdirSync('./extensions/dev')
    .filter(f => f.endsWith('.ts') || f.endsWith('.js'));

  const extensions = files.map(file => {
    const content = fs.readFileSync(`./extensions/dev/${file}`, 'utf-8');
    const metadata = parseMetadata(content);

    return {
      filename: file,
      metadata,
      content
    };
  });

  res.json(extensions);
});

// Watch for changes
const watcher = chokidar.watch('./extensions/dev/**/*.{ts,js}', {
  ignoreInitial: true
});

watcher.on('change', (filePath) => {
  const filename = path.basename(filePath);
  const content = fs.readFileSync(filePath, 'utf-8');
  const metadata = parseMetadata(content);

  console.log(`🔄 Extension changed: ${filename}`);

  // Broadcast to all connected mobile devices
  const message = JSON.stringify({
    type: 'extension-updated',
    filename,
    metadata,
    content
  });

  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
});

watcher.on('add', (filePath) => {
  const filename = path.basename(filePath);
  const content = fs.readFileSync(filePath, 'utf-8');
  const metadata = parseMetadata(content);

  const message = JSON.stringify({
    type: 'extension-added',
    filename,
    metadata,
    content
  });

  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
});

app.listen(PORT, () => {
  console.log(`
🚀 Extension Dev Server Running

HTTP: http://localhost:${PORT}
WebSocket: ws://localhost:3457

For mobile, use your computer's IP:
HTTP: http://192.168.1.X:${PORT}
WebSocket: ws://192.168.1.X:3457
  `);
});
```

#### Mobile Client

```typescript
// lib/dev-server.ts
export class DevServerClient {
  private ws: WebSocket | null = null;
  private config: DevServerConfig;

  constructor(config: DevServerConfig, onUpdate: (message: any) => void) {
    this.config = config;
    this.onUpdate = onUpdate;
  }

  async connect() {
    if (!this.config.enabled || !this.config.wsUrl) return;

    this.ws = new WebSocket(this.config.wsUrl);

    this.ws.onopen = () => {
      console.log('✅ Connected to dev server');
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.onUpdate(message);
    };

    this.ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('🔌 Disconnected from dev server');
      // Attempt reconnect after 5 seconds
      setTimeout(() => this.connect(), 5000);
    };
  }

  async syncExtensions() {
    if (!this.config.enabled || !this.config.httpUrl) return [];

    const response = await fetch(`${this.config.httpUrl}/api/extensions`);
    const extensions = await response.json();

    console.log(`📥 Synced ${extensions.length} extensions from dev server`);

    return extensions;
  }
}

// Handle updates
async function handleExtensionUpdate(message: any) {
  console.log(`🔄 Updating extension: ${message.filename}`);

  // Uninstall old version
  const extensionId = await getExtensionIdByFilename(message.filename);
  if (extensionId) {
    await uninstallExtension(extensionId, { keepFile: false });
  }

  // Install new version
  await installDevExtension(message);

  showToast(`Extension updated: ${message.metadata.name}`);
}
```

### Mobile Dev Workflow

1. **Start dev server on computer:**
   ```bash
   cd ~/projects/my-extensions
   npm run dev:server

   # Shows:
   # HTTP: http://192.168.1.100:3456
   # WebSocket: ws://192.168.1.100:3457
   ```

2. **Configure mobile app:**
   - Settings → Dev Server
   - Enable Dev Server
   - Enter URLs from dev server
   - Test Connection
   - Sync Extensions

3. **Edit extensions:**
   - Edit `spotify.ts` on computer
   - Save file
   - Mobile app receives update via WebSocket
   - Extension hot reloads instantly

## URL Scheme System

Extensions are accessible via custom URLs:

```typescript
// URL format: crotchet://[type]/[scheme]/[name]
// Examples:
crotchet://actions/spotify/randomTrack
crotchet://widgets/spotify/nowPlaying
crotchet://sections/spotify/playlists
```

### URL Handler

```typescript
function handleUrl(url: string) {
  const parsed = new URL(url);

  if (parsed.protocol !== 'crotchet:') return;

  const type = parsed.host; // 'actions', 'widgets', etc
  const [scheme, name] = parsed.pathname.slice(1).split('/');

  const key = `${scheme}/${name}`;

  if (type === 'actions') {
    const action = registry.actions[key];
    if (action) {
      action.config.handler();
    }
  } else if (type === 'widgets') {
    const widget = registry.widgets[key];
    if (widget) {
      // Open widget or perform action
    }
  }
}

// Usage:
handleUrl('crotchet://actions/spotify/randomTrack');
```

## Platform APIs

### Desktop (Electron)

```typescript
// Provided via preload.js
contextBridge.exposeInMainWorld('extensionAPI', {
  registerAction: (name, config) => { /* ... */ },
  registerWidget: (name, config) => { /* ... */ },
  openPage: (config) => { /* Electron window */ },
  showToast: (msg) => { /* Native notification */ },
  savePreference: (key, val) => { /* localStorage */ },
  // ... more APIs
});
```

### Mobile (Expo)

```typescript
// Provided via React Context
export const ExtensionContext = createContext({
  registerAction: (name, config) => { /* ... */ },
  registerWidget: (name, config) => { /* ... */ },
  openPage: (config) => { /* React Navigation */ },
  showToast: (msg) => { /* Toast component */ },
  savePreference: (key, val) => { /* AsyncStorage */ },
  // ... more APIs
});
```

## Example Extensions

### Clipboard Extension

```typescript
// @name Clipboard Utils
// @scheme clipboard
// @description Clipboard management utilities
// @author Crotchet
// @version 1.0.0
// @tags clipboard, utility

import * as Clipboard from 'expo-clipboard';
import { Alert } from 'react-native';

export default {
  install(context) {
    const { registerAction, registerWidget } = context;

    registerAction('copy', {
      label: 'Copy Text',
      icon: 'copy',
      context: 'search',
      handler: async (payload) => {
        const text = payload?.text || 'Sample text';
        await Clipboard.setStringAsync(text);
        Alert.alert('Success', 'Copied to clipboard');
      }
    });

    registerAction('view', {
      label: 'View Clipboard',
      icon: 'clipboard',
      context: 'shortcut',
      handler: async () => {
        const text = await Clipboard.getStringAsync();
        Alert.alert('Clipboard', text || 'Empty');
      }
    });
  }
}
```

### Unsplash Extension

```typescript
// @name Unsplash Photos
// @scheme unsplash
// @description Browse and search Unsplash photos
// @author Crotchet
// @version 1.0.0
// @tags images, photos, unsplash

export default {
  install(context) {
    const { registerAction, registerWidget, openPage } = context;

    const searchUnsplash = async (query = '') => {
      const clientId = 'YOUR_CLIENT_ID';
      const url = `https://api.unsplash.com/search/photos?query=${query}&client_id=${clientId}`;
      const res = await fetch(url);
      const data = await res.json();

      return data.results.map(photo => ({
        title: photo.alt_description,
        subtitle: photo.user.name,
        image: photo.urls.regular,
        url: photo.links.html
      }));
    };

    registerAction('search', {
      label: 'Search Photos',
      icon: 'search',
      global: true,
      handler: async () => {
        await openPage({
          type: 'search',
          title: 'Unsplash Photos',
          resolve: async ({ query }) => searchUnsplash(query),
          layout: 'masonry'
        });
      }
    });

    registerWidget('randomPhoto', {
      label: 'Random Photo',
      resolve: async () => {
        const photos = await searchUnsplash('nature');
        return photos[Math.floor(Math.random() * photos.length)];
      },
      content: ({ data }) => data ? `<img src="${data.image}" />` : null,
      onSwipe: ({ refetch }) => refetch()
    });
  }
}
```

## Security Considerations

### External Extension Validation

Before loading external extensions:

1. **Parse and validate syntax**
2. **Check for dangerous patterns:**
   - `eval()`
   - `Function()`
   - Remote code execution
3. **Sandbox execution** - no Node.js APIs, only provided APIs
4. **User confirmation** for first-time external extensions
5. **Ability to review code** before enabling

### Sandboxing

```typescript
function validateExtensionCode(code: string): boolean {
  const dangerousPatterns = [
    /\beval\s*\(/,
    /Function\s*\(/,
    /require\s*\(/,
    /import\s*\(/,
    /\.importScripts\s*\(/,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(code)) {
      return false;
    }
  }

  return true;
}
```

## Benefits

✅ **Write once, run anywhere** - Same extension works on desktop and mobile
✅ **Hot reload** - Instant feedback during development
✅ **Hash-based IDs** - Unique identity, tracks content changes
✅ **Human-readable URLs** - `crotchet://actions/spotify/randomTrack`
✅ **Scheme conflict detection** - Prevents namespace collisions
✅ **Clean uninstall** - Removes all extension registrations
✅ **Install once pattern** - Extensions register on install, not on every load
✅ **Type safe** - TypeScript definitions for context APIs
✅ **Event-driven** - Extensions can communicate via events
✅ **Version tracking** - Compare hashes for updates
✅ **Dev mode** - Work on extensions in packaged apps

## Next Steps

1. Implement core registry system
2. Create context injection for desktop/mobile
3. Build extension loader
4. Implement hot reload for desktop
5. Create dev server for mobile
6. Add settings UI for dev mode
7. Build example core extensions
8. Create external extension installer (gists)
9. Add security validation
10. Write documentation and examples
