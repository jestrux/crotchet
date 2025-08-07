## Crotchet Hybrid PRD (Electron Desktop + React Native Mobile)

### 1) Summary
- Goal: Maintain Crotchet’s command-bar, actions/pages, data sources, and remote-control model while adopting a hybrid stack:
  - Desktop: Electron (main + preload + React/Vite renderer)
  - Mobile: React Native (Expo Router)
- Preserve integrations: Firebase (Firestore/Storage), WebSocket/Socket.IO, URL schemes, clipboard/share flows, Pinboard, code-to-image on desktop.
- Deep link scheme (desktop and mobile): `crochet-app-hybrid://`

### 2) Problem & Goals
- Problem: Current web renderer is tightly coupled to Ionic/Capacitor; we want a cleaner split between desktop (Electron) and mobile (React Native) with clearer module boundaries and modern tooling.
- Goals:
  - Clean electron app shell with preload-isolated bridge APIs.
  - RN app with native-feeling navigation and Share/Clipboard flows.
  - Reuse protocol and data models; keep Firestore as simple data backend.

### 3) Users & Use Cases
- Keyboard-driven power users; quick actions/search; pinboard and clipboard share; mobile remote control; code-to-image utility on desktop.

### 4) Architecture Overview
- Desktop (Electron):
  - Main process: lifecycle, tray, global shortcuts (Alt+/), floating windows, WebSocket/Socket.IO server, IPC.
  - Preload: contextBridge-exposed, type-safe APIs: `realtime`, `clipboard`, `files`, `windows`, `deeplinks`.
  - Renderer: React + Vite, command palette UI, pages stack, remote controller UI.
- Mobile (React Native):
  - App shell: Expo Router (file-based), palette UI, remote controller, pinboard views.
  - Share: ShareMenu (or custom iOS extension) to normalize payloads (text/url/image/file) and route to actions.
  - Realtime: WebSocket client to the desktop server; discovery via Firestore doc (parity with current).
- Data: Firebase Firestore/Storage for pinboard and assets; optional local cache.

### 5) Functional Requirements (Parity)
1) Actions: register built-in actions (label/icon/color/shortcut/context), trigger from palette, tray, deep link.
2) Pages: search/detail/form/tabbed; stack navigation; bind search to data sources.
3) Data Sources: `db` (Firestore CRUD + live updates) and `crawler` (cloud function or in-app fetch) with entry actions/preview.
4) Remote Control: desktop server broadcasts page changes; mobile triggers `remote-action` and close/open events.
5) Clipboard & Share: desktop copy/paste and image copy; mobile Share integration and in-app clipboard read.
6) Pinboard: add/edit/delete; open via URL or copy.
7) Code Screenshot (Desktop): render code (CodeMirror or Monaco in renderer), copy/download as PNG.

### 6) Non‑Functional Requirements
- Security: IPC isolated, preload-only bridges; CSP in renderer; permissioned APIs.
- Performance: Overlay open <150ms; fast hotkey; smooth RN navigation.
- Reliability: WS reconnect with backoff; offline-friendly pinboard reads.
- Accessibility: keyboard navigation, screen reader labels.

### 7) Protocol (WS/Socket.IO)
- Maintain current event semantics: `remote-page-changed`, `remote-page-closed`, `open-remote-page-controller`, `floating-window-event`, `run-action`, `open-page`, `close-page`.
- Message format: JSON with stable keys; allow both Socket.IO and plain WS via a thin adapter.

### 8) Data Model (Core)
- Action, Page, DataSource, PinnedItem — same fields as `native/PRD.md` for parity.

### 9) Migration Strategy (High Level)
- Phase 1: Scaffold Electron app + RN app shells with bridges and navigation.
- Phase 2: Implement WS server (desktop) + client (mobile) and Firestore discovery.
- Phase 3: Port data sources (Firestore `db`, `crawler`) and pinboard screens.
- Phase 4: Implement actions/pages and palette UIs on both platforms.
- Phase 5: Code screenshot tooling in Electron renderer; polish and a11y.

### 10) Risks & Mitigations
- RN Share extension complexity (iOS): use `react-native-share-menu` or custom native extension module.
- IPC security: strict preload bridges, validate payloads, least-privilege APIs.
- Desktop packaging codesigning: plan electron-builder configuration early.

### 11) Acceptance Criteria (V1)
- Desktop: Tray + hotkey overlay + floating windows; actions/pages working; WS server; pinboard functional; code screenshot works.
- Mobile: RN app with palette + remote controller; Share integration; pinboard functional; WS client connected via discovery.
- Data: Firestore rules enforced; parity features demonstrated end-to-end.
