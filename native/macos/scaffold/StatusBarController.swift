import Cocoa

final class StatusBarController {
    private var statusItem: NSStatusItem?

    init() {
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        if let button = statusItem?.button {
            button.title = "⌘ C"
            button.action = #selector(toggleOverlay)
            button.target = self
        }
        let menu = NSMenu()
        menu.addItem(withTitle: "Show/Hide", action: #selector(toggleOverlay), keyEquivalent: "")
        menu.addItem(.separator())
        menu.addItem(withTitle: "Quit", action: #selector(quit), keyEquivalent: "q")
        statusItem?.menu = menu
    }

    @objc private func toggleOverlay() {
        NotificationCenter.default.post(name: .toggleOverlay, object: nil)
    }

    @objc private func quit() {
        NSApp.terminate(nil)
    }
}

extension Notification.Name {
    static let toggleOverlay = Notification.Name("toggleOverlay")
}
