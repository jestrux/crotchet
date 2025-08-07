# Implementation Plan (High-level Scaffolding)

This plan focuses on scaffolding the native macOS and iOS apps and a minimal Chrome extension shell, aligned with `native/PRD.md` and `native/musings.md`. It intentionally defers business logic and integrations.

---

## 0) Workspace & Repo Layout (Single workspace, split targets)
- Use a single Xcode workspace with two app targets and one shared Swift Package.
- Keep both apps in this repo; share code via a Swift Package for models/utilities/theme.

```
native/
  Crotchet.xcworkspace            # One workspace
  Shared/                         # Swift Package: shared types/theme/utils
    Package.swift
    Sources/
      CrotchetShared/
        Theme/
        Models/
        Utils/
  macos/                          # macOS target sources
    CrotchetMac/
      CrotchetMacApp.swift
      Info.plist
      Features/
      Services/
      Shared/ (local target-specific shared views)
  ios/                            # iOS target sources
    CrotchetIOS/
      CrotchetIOSApp.swift
      Info.plist
      Extensions/
        ShareExtension/
          Info.plist
          ShareView.swift
      Features/
      Services/
      Shared/
  chrome-extension/               # Minimal MV3 shell (unchanged)
```

- Shared Package name suggestion: `CrotchetShared` (module importable by both targets).
- URL scheme (both targets): `crochet-app`.

---

## 1) macOS Target Scaffolding (Swift/SwiftUI)

### 1.1 Targets & Signing
- Add `CrotchetMac` app target to the workspace.
- App ID: e.g., `tz.co.akil.crotchet.mac`
- Set signing team/profiles and sandbox as required.

### 1.2 Dependencies (SPM)
- Add via Swift Package Manager (placeholders for later wiring):
  - `HotKey` (global shortcut) — https://github.com/soffes/HotKey
  - (Optional for later) Firebase Apple SDKs (Firestore/Storage)
  - Add local package `Shared/` as `CrotchetShared` dependency

### 1.3 URL Scheme
- Register custom URL scheme `crochet-app` in macOS target Info.plist.
  - Handle deeplinks (no-op handlers are fine for scaffold), e.g., `crochet-app://install-extension?...`.

### 1.4 Menu Bar + Overlay Window
- Status bar item using `NSStatusBar` with menu (Show/Hide, About, Quit).
- SwiftUI App sets up an overlay window using `NSWindow`:
  - Borderless, translucent, floating level, key and visible on all spaces.
  - Show on global hotkey (Alt+/ by default; rebindable), hide on resign key/blur.
- Create minimal SwiftUI placeholders:
  - `CommandPaletteView()`
  - `EmptyPageView()`

### 1.5 Floating Windows Manager (Placeholder)
- Add a simple manager to create/destroy additional `NSWindow` instances for floating windows.
- Wire minimal lifecycle (open/close) logs for later integration.

### 1.6 Theming (Desktop)
- Establish design tokens and SwiftUI theme model (in `CrotchetShared/Theme`):
  - Tokens: canvas, card, content, contentInverted, primary, primaryLight.
  - Detect system appearance and sync: `.preferredColorScheme`, `NSApp.effectiveAppearance`.
  - Provide `ThemeProvider` (ObservableObject) with dynamic properties and environment injection.
  - Support accent color selection (UserDefaults) for later.

---

## 2) iOS Target Scaffolding (Swift/SwiftUI)

### 2.1 Targets & Signing
- Add `CrotchetIOS` app target and `CrotchetShareExtension` extension target to the workspace.
- App ID: e.g., `tz.co.akil.crotchet.ios`
- Share Extension ID: `tz.co.akil.crotchet.ios.share`
- Configure entitlements as needed for the extension.

### 2.2 Dependencies (SPM)
- (Placeholders) Firebase Apple SDKs (for later, if needed)
- Add local package `Shared/` as `CrotchetShared` dependency

### 2.3 URL Scheme
- Register custom scheme `crochet-app` in iOS target Info.plist (no-op handlers acceptable for scaffold).

### 2.4 App Shell
- SwiftUI root with a lightweight palette & empty page stack placeholders:
  - `CommandPaletteView()`
  - `PlaceholderView()`
- Maintain simple navigation via `NavigationStack`.

### 2.5 Share Extension Shell
- Target `CrotchetShareExtension` with NSExtensionActivationRules:
  - Accept text, URLs, images (jpg/png), and PDFs.
- Process input items into a normalized payload (log-only for scaffold) and present a minimal SwiftUI confirmation sheet.

### 2.6 Theming (Mobile)
- Use SwiftUI dynamic colors and asset catalogs (Light/Dark variants).
- Create `ThemeProvider` (ObservableObject) shared via environment (preferably sourced from `CrotchetShared/Theme`).
- Mirror desktop tokens (canvas/card/content/primary) for consistency.

---

## 3) Shared Swift Package (CrotchetShared)
- Create a Swift Package in `native/Shared/` included in the workspace.
- Expose:
  - Theme tokens and `ThemeProvider`
  - Shared models/DTOs: `Action`, `Page` (scaffold only)
  - Lightweight utilities (formatting, storage wrappers) as needed later
- Both `CrotchetMac` and `CrotchetIOS` depend on this package.

---

## 4) Chrome Extension Scaffolding (Minimal, MV3)

### 4.1 Directory Structure
```
chrome-extension/
  manifest.json
  src/
    content.js (placeholder)
    service_worker.js (placeholder)
    popup/
      popup.html
      popup.js
    styles/
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
- No content-specific logic yet (no gist scanning)

### 4.3 Placeholder Behavior
- Popup renders a simple UI with app name and a disabled "Install" button (for future wiring)
- Content script and service worker contain no-op listeners

### 4.4 Theming (Chrome Extension)
- Use CSS variables in `:root` and `[data-theme="dark"]` for dark/light.
- Toggle via popup (store preference in `chrome.storage`).

---

## 5) Cross-cutting Setup (Scaffold Only)
- URL handler test stubs: macOS & iOS open `crochet-app://...` (log only)
- Global hotkey test on macOS: toggles overlay window visibility
- Basic theming placeholders (light/dark) at the view level

---

## 6) Next Steps After Scaffolding (Defer Implementation)
- Wire data and integrations (e.g., Firestore, networking) later
- Add action/page models to actual UI flows
- Implement extension runtime and installation pipeline in subsequent phases
