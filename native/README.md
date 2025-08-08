# Crotchet Native Scaffolding

This directory hosts scaffolding for fully native macOS and iOS apps plus a shared Swift Package `CrotchetShared`.

## What exists
- `Shared/` Swift Package (`CrotchetShared`) with Theme and Models
- macOS app stubs: `CrotchetMacApp.swift`, `Info.plist`, `CrotchetMac.entitlements`, `StatusBarController.swift`, `OverlayWindow.swift`
- iOS app stubs: `CrotchetIOSApp.swift`, `Info.plist`
- iOS Share Extension stubs: `Extensions/ShareExtension/Info.plist`, `ShareExtension.entitlements`, `ShareView.swift`
- Shared utility: `AppScheme` = `crochet-app`

## Wire-up steps (Xcode)
1. Create a new Xcode Workspace `Crotchet.xcworkspace` in `native/`.
2. Add two new app targets:
   - macOS SwiftUI App: `CrotchetMac` (bundle id: `tz.co.akil.crotchet.mac`)
   - iOS SwiftUI App: `CrotchetIOS` (bundle id: `tz.co.akil.crotchet.ios`)
3. Add a new iOS Share Extension target `CrotchetShareExtension` (bundle id: `tz.co.akil.crotchet.ios.share`).
4. Add the local Swift Package:
   - File > Add Packages… > Add Package (Local) and select `native/Shared`.
   - Link `CrotchetShared` to both app targets and the extension.
5. Drag the provided source files into the appropriate targets (ensure target membership):
   - macOS: `CrotchetMacApp.swift`, `StatusBarController.swift`, `OverlayWindow.swift`, `Info.plist`, `CrotchetMac.entitlements`
   - iOS: `CrotchetIOSApp.swift`, `Info.plist`
   - Share Extension: `ShareView.swift`, `Extensions/ShareExtension/Info.plist`, `ShareExtension.entitlements`
6. URL Schemes:
   - In each app target Info, add URL Type with scheme `crochet-app`.
7. Signing & Capabilities:
   - Assign your Team for each target.
   - macOS: consider enabling App Sandbox and required entitlements later.
   - iOS Share Extension: configure an App Group matching `group.tz.co.akil.crotchet` or adjust the entitlements.
8. Build & Run each target to validate the scaffold boots.

## Next steps
- macOS: Implement menu bar status item lifecycle, global hotkey, and overlay presentation.
- iOS: Add simple navigation stack and placeholder pages.
- Share Extension: Wire a basic controller hosting `ShareView` and parse input items.
