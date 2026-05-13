# 🧩 Extension System – Product Requirements Document (PRD)

## 📌 Overview

This system enables developers to create and share custom extensions for a SwiftUI-based macOS and iOS app. Extensions are written in **TypeScript with React**, require **no build step**, and are installed via **public gists** or scanned **QR codes**. The app will interpret these extensions in a secure, sandboxed runtime, with access to app-specific APIs.

---

## 🎯 Goals

- Allow developers to create extensions using familiar web technologies (TypeScript + React).
- Support frictionless installation and updates of extensions (via gist URLs or QR codes).
- Provide an in-app runtime for rendering extension UIs using a custom React renderer.
- Deliver a seamless, scriptable developer experience with zero setup.
- Enable users to install extensions from mobile using a **Chrome extension** and **QR code**.
- Keep extensions lightweight, inspectable, and open-source friendly.

---

## 🧑‍💻 Platforms & Architecture

### macOS App

- Built with **SwiftUI** as a **menu bar app** with:
  - No dock icon
  - Global keyboard shortcut to open
- Loads and runs extensions locally via JavaScriptCore or WebView
- Extensions can present UI in a popover or floating window rendered via a React runtime

### iOS App

- Built with **SwiftUI**
- Features a **chat-style interface**
- Extensions can act as tools within this interface or be opened full-screen
- Same extension API/runtime as macOS

### Shared Runtime

- Both platforms share:
  - A TypeScript API definition
  - The extension sandbox/execution layer
  - WebSocket connection for sync when needed

---

## 🧱 Extension Format

### File Type

- A **single `.ts` file**, possibly with embedded JSX
- Optional `.tsx` support (depending on runtime constraints)

### Metadata Block (Required)

Located in the top comment block of the file:

```ts
/**
 * @name Quick File Search
 * @version 1.2.0
 * @description Search and open files by name
 * @author walter
 * @icon 🔍
 * @type ui
 */
```

### Supported Metadata Fields

| Field         | Description                                           |
|---------------|-------------------------------------------------------|
| `@name`       | Display name                                          |
| `@version`    | Semantic version (used for update detection)         |
| `@description`| Short description                                     |
| `@author`     | Developer name or handle                             |
| `@icon`       | Emoji or string icon                                 |
| `@type`       | Either `ui` or `action`                              |

### Example File

```ts
/**
 * @name Quick File Search
 * @version 1.2.0
 * @description Search and open files by name
 * @author walter
 * @icon 🔍
 * @type ui
 */

export default function App() {
  return <div>Hello from Extension!</div>;
}
```

---

## 📦 Extension API

### Available APIs (subject to permissions)

- `openFile(path: string)`
- `pickFile() => Promise<string>`
- `showNotification(message: string)`
- `log(message: string)`
- `getClipboard() => Promise<string>`
- WebSocket messaging

APIs exposed via a type-safe bridge using `JavaScriptCore` (macOS) and `WKWebView` or JavaScriptCore (iOS).

---

## 🧩 Developer Experience

### Installation

- Extensions are installed by:
  1. **Pasting a Gist URL**
  2. **Scanning a QR code**
- The app fetches the gist’s raw `.ts` file
- Parses metadata, validates structure, checks version, and registers the extension

### No Build Required

- App uses an embedded TypeScript transpiler (e.g., [esbuild-wasm], [swc], or [sucrase]) to transpile `.ts` files at runtime
- JSX is handled inline; no external bundlers needed

---

## 🧭 Chrome Extension Integration

### Purpose

- Detect valid public gists with extension files
- Show install prompt in toolbar
- Generate and display **QR code** that links to the extension

### Detection

- Uses DOM analysis or GitHub's API to check for `@name` metadata in code blocks

### QR Code

- Encodes a URL like:
  ```
  appname://install-extension?source=https://gist.github.com/username/abc123.ts
  ```
- When scanned, the iOS/macOS app fetches, validates, and installs the extension

---

## 🔄 Update Handling

- Each installed extension stores:
  - `gist URL`
  - `installed version`
  - `last update time`
- App checks periodically (or on launch) whether the gist’s content has changed
- If new version is detected:
  - Notifies user
  - Allows one-tap update or auto-update for built-in extensions

---

## 🧰 Built-in Extensions

- Stored locally in the app bundle
- Use same metadata format but don’t require internet to install
- Auto-updated via app releases

---

## 🔐 Security & Sandboxing

- Extensions run in a **sandboxed JS environment**:
  - No `eval`, `fetch`, or raw DOM access unless explicitly allowed
  - Whitelisted APIs only
- All extensions must be **read-only** unless given specific permission (e.g., `@permission write`)

---

## 🧪 Testing & Validation

- On install, each extension undergoes:
  - Metadata validation
  - TypeScript transpile test
  - Static analysis for disallowed keywords (e.g., `eval`)
- UI previews available before enabling the extension

---

## 📊 Analytics (Optional)

- Extension usage (opt-in telemetry)
- Extension load errors
- Popular extensions (aggregated stats for a future gallery)

---

## 🧭 Roadmap (Future Features)

| Feature | Description |
|--------|-------------|
| Extension Gallery | In-app directory to browse, preview, and install extensions |
| GitHub Login | For syncing private gists |
| Extension Signing | Optional signature system for trusted developers |
| Testing Harness | CLI tool to simulate extension behavior during development |
