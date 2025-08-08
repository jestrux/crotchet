import SwiftUI
import CrotchetShared

@main
struct CrotchetMacApp: App {
    @StateObject private var theme = ThemeProvider()
    @StateObject private var preferences = Preferences()

    @State private var statusBarController = StatusBarController()
    @State private var hotkeyManager = GlobalHotkeyManager()
    @State private var overlay: OverlayWindow?

    var body: some Scene {
        WindowGroup {
            VStack(alignment: .leading, spacing: 12) {
                ContentView()
                    .environmentObject(theme)
                PreferencesView()
                    .environmentObject(preferences)
            }
            .frame(width: 360, height: 200)
            .onAppear {
                setupNotifications()
                hotkeyManager.configure(with: preferences)
                hotkeyManager.start()
            }
        }
        .windowStyle(.hiddenTitleBar)
    }

    private func setupNotifications() {
        NotificationCenter.default.addObserver(forName: .toggleOverlay, object: nil, queue: .main) { _ in
            toggleOverlay()
        }
    }

    private func toggleOverlay() {
        if let existing = overlay {
            if existing.isVisible { existing.orderOut(nil) } else { existing.makeKeyAndOrderFront(nil) }
            return
        }
        let win = OverlayWindow {
            VStack(alignment: .leading, spacing: 8) {
                Text("Crotchet macOS (Native) Scaffold")
                    .font(.headline)
                Text("Overlay triggered by hotkey preference")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            .padding(16)
        }
        win.makeKeyAndOrderFront(nil)
        overlay = win
    }
}

struct ContentView: View {
    var body: some View { Color.clear }
}

struct PreferencesView: View {
    @EnvironmentObject var preferences: Preferences
    var body: some View {
        Form {
            Picker("Hotkey", selection: $preferences.hotkey) {
                Text("Caps Lock").tag(HotkeyPreference.capsLock)
                Text("Option + /").tag(HotkeyPreference.optionSlash)
            }
        }
        .padding(12)
    }
}
