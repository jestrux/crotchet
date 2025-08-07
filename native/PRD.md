## Crotchet Native PRD (macOS + iOS)

### 1) Summary
- Crotchet is a cross‑platform launcher/command-bar with extensible actions, pages, widgets, and data sources. Today it runs on Electron (desktop) and Capacitor iOS (mobile), using Socket.IO and Firebase for lightweight data and remote control.
- This PRD defines a migration to fully native macOS and iOS apps that preserve current capabilities (actions, pages, remote control, clipboard/share workflows, pinboard, code-to-image) while improving performance, native UX, and maintainability.

### 2) Problem & Goals
- **Problem**: Electron/Capacitor increase complexity and memory footprint; desktop tray + floating windows + global shortcuts are better served natively. On iOS, a full-native app and Share Extension provide a smoother user experience and system integrations.
- **Goals**:
  - Native macOS app (menu bar + global hotkey overlay) that replaces Electron.
  - Native iOS app that replaces Capacitor and supports Share Extension and clipboard workflows.
  - Preserve core features: actions/pages/widgets, pinboard (Firestore), code-screenshot flow, remote control between devices, and link preview crawler behavior.
  - Improve startup time, memory usage, and reliability of hotkeys, tray, and floating windows.
- **Non‑Goals (V1)**:
  - A public third-party extension SDK. Focus on internal/built-in extensions and configuration.
  - Android or Windows native ports.

### 3) Users & Use Cases
- Power users who want a fast command bar to:
  - Run actions via keyboard, shortcuts, or tray/menu.
  - Search data sources (Firestore-backed lists, crawled links) and open results.
  - Capture/share content from clipboard or iOS Share Sheet into the app (e.g., pin items).
  - Remotely control desktop pages from phone (e.g., actions on floating windows).

### 4) Current Architecture (for parity)
- Renderer: React + Ionic + Tailwind, bootstrapped in `app/main.jsx`.
- Desktop: Electron app (`desktop/index.js`) creates a transparent window, tray, global shortcuts (Alt+/), floating windows, and runs an Express + Socket.IO server.
- Mobile: Capacitor iOS app; clipboard/files/share; connects to desktop via Socket.IO.
- Data: Firebase Firestore/Storage used for simple tables (e.g., `pinnedItems`) and to publish the desktop socket URL.
- Extensions: Internal registration APIs provide `registerAction`, `registerPage`, `registerDataSource`, `registerWidget` along with URL schemes like `crotchet://action/...` and `crotchet://data-source/...`.

### 5) Target Native Architecture
#### macOS (Swift/SwiftUI)
- App Type: Menu Bar app with a global overlay window.
  - Menu bar via `NSStatusBar` with menu items (Show/Hide, About, Quit).
  - Global hotkey using HotKey/EventTap for Alt+/ (rebindable).
  - Overlay: borderless, translucent `NSWindow` on floating level; hides on blur.
- Windows & Navigation:
  - Main overlay hosts a command palette and page stack (SwiftUI NavigationStack).
  - Floating windows: separate `NSWindow` instances; lifecycle events dispatched internally.
- Inter‑process & Remote Control:
  - Replace Socket.IO server with native WebSocket (SwiftNIO/Network). Keep JSON event schema compatible with current semantics.
  - Continue publishing the desktop WS URL to Firestore for iOS discovery.
- Data & Storage:
  - Keep Firebase Firestore/Storage for `pinnedItems` and assets (parity) via Firebase Apple SDKs.
  - Preferences via `UserDefaults`.
- Clipboard & Utilities:
  - Native clipboard (`NSPasteboard`) text/image, paste action.
  - Link preview via existing cloud endpoint; optional native HTML parse fallback later.

#### iOS (Swift/SwiftUI)
- App: SwiftUI app with command interface and page stack (search/detail/form).
- Share Extension: Accept text/URL/images/PDFs, normalize payload, and route to actions (e.g., Add to Pinboard).
- Remote Controller: Connect to macOS WS endpoint; list remote pages; trigger actions; control floating windows.
- Clipboard & Files: `UIPasteboard`, Files framework.
- Data: Firebase Firestore/Storage for Pinboard and live updates.

### 6) Functional Requirements
1) Actions
  - Register built‑in actions with label, icon, color, shortcut, visibility (desktopOnly/mobileOnly), context (share/global), preview content, and handler.
  - Trigger via palette, tray/menu, hotkey, or deep link.

2) Pages
  - Types: search, detail, form, tabbed.
  - Push/pop stack with resolver semantics (map to async/await in Swift).
  - Search page can bind to a data source; provides placeholder, entry action(s), and preview.

3) Data Sources
  - `db` provider backed by Firestore with CRUD and live updates; supports `orderBy`, `mapEntry`, `entryAction(s)`, `entryPreview`.
  - `crawler` provider via cloud function or native HTML parsing to produce `meta { image, title, description }`.

4) Remote Control
  - macOS hosts local WebSocket endpoint; iOS connects and:
    - Lists remote pages, opens controller UI, triggers actions.
    - Handles floating window channel for per-window actions and close events.

5) Clipboard & Share
  - macOS: Read clipboard, open action sheet with derived payload; copy text/images and paste as needed.
  - iOS: Share Extension normalizes payload and routes to actions; in-app clipboard reads similarly.

6) Pinboard
  - Add from clipboard/share; auto-enrich via crawler.
  - View, edit, delete; open via URL or copy.

7) Code Screenshot (Desktop)
  - Use a WebView hosting CodeMirror or native highlight (Highlightr) to render code and export image (copy/download).

### 7) Non‑Functional Requirements
- Performance: Instant hotkey response (<80ms), overlay open <150ms on modern Macs.
- Memory: Target <100MB resident (macOS idle), <60MB (iOS foreground).
- Reliability: WS reconnect with backoff; robust to network changes.
- Accessibility: VoiceOver/AX support; correct focus management.
- Privacy/Security: Scoped Firestore rules; sanitize URLs/HTML responses.

### 8) Protocol (WebSocket) — Event Outline
- Channel: ws://<local-ip>:<port>/ (macOS publishes URL to Firestore for discovery)
- Messages (JSON):
  - From iOS → macOS:
    - `emit { event: "remote-action", payload: { pageId, floating, action, ... } }`
    - `close-page { pageId }`
    - `open-floating-window { payload }`
  - From macOS → iOS:
    - `remote-page-changed { page }`
    - `remote-page-closed { page }`
    - `floating-window-event { _id, action, ... }`
    - `open-remote-page-controller { pageId }`

### 9) Data Model (Core)
- Action: `{ id, name, label, icon, color, shortcut?, context?, desktopOnly?, mobileOnly?, handlerType, preview? }`
- Page: `{ id, type, title?, actions[], entryAction?, entryActions?, entryPreview?, resolve? }`
- DataSource: `{ id, provider: 'db'|'crawler'|'custom', name, get(params), insertRow?, updateRow?, deleteRow?, listenForUpdates? }`
- PinnedItem: `{ id, text?, url?, image?, file?, createdAt, updatedAt }`

### 10) Migration Strategy
1) Phase 0 — Planning: lock parity, define message schema, confirm Firestore structure.
2) Phase 1 — macOS Native Core: menu bar + overlay + hotkey; native WS server; clipboard utils; floating windows; run/open/close events.
3) Phase 2 — iOS Native + Share Extension: app, remote controller, Share Extension payload normalization and routing.
4) Phase 3 — Data Sources & Pinboard: Firestore provider, search, CRUD, previews.
5) Phase 4 — Code Screenshot (Desktop): WebView/Highlightr and image export.
6) Phase 5 — Polish & Parity: theming, a11y, performance, prefs.

### 11) Tech Choices (Proposed)
- macOS: Swift 5, SwiftUI, AppKit (NSStatusBar/NSWindow), HotKey, SwiftNIO (WebSocket) or keep Socket.IO via sidecar (fallback).
- iOS: SwiftUI app + Share Extension; Firebase SDK; URLSessionWebSocketTask or Starscream.
- Crawler: Continue cloud function; add native fallback later.
- Persistence: Firestore + `UserDefaults`; consider CoreData cache later.

### 12) Acceptance Criteria (V1)
- macOS: Menu bar item, hotkey toggles overlay, pages open/close, floating windows work, remote control receives actions, clipboard workflows function, pinboard usable.
- iOS: Connects to macOS, remote pages/actions functional, Share Extension routes payloads to actions, clipboard workflow, pinboard synced.
- Data: Firestore rules scoped; WS URL publish/read works.
- Performance and basic a11y baselines met.

### 13) Risks & Mitigations
- Socket.IO → WebSocket migration: define stable JSON schema; provide compatibility layer initially.
- Global hotkey conflicts: allow rebinding; fallback combos.
- Floating window focus/z‑order: test multi‑screen; correct window levels.
- Share Extension limits: keep payloads small; offload heavy work to host app.

### 14) Open Questions
- Keep Socket.IO (Node) vs. pure native WebSocket?
- Re-introduce public extension SDK post‑V1?
- Theming approach: replicate or new native theme system?

### 15) Milestones (tentative)
- M1 (2–3 wks): macOS shell + WS + clipboard.
- M2 (2 wks): iOS app + remote controller + discovery.
- M3 (2–3 wks): Pinboard + data sources.
- M4 (1–2 wks): Code Screenshot + polish.
- M5 (1 wk): A11y, perf, release prep.
