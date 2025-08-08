import Cocoa
import SwiftUI

final class OverlayWindow: NSWindow {
    convenience init<Content: View>(@ViewBuilder content: () -> Content) {
        let hosting = NSHostingView(rootView: content())
        self.init(
            contentRect: NSRect(x: 0, y: 0, width: 750, height: 480),
            styleMask: [.borderless],
            backing: .buffered,
            defer: false
        )
        self.level = .floating
        self.isOpaque = false
        self.backgroundColor = .clear
        self.hasShadow = true
        self.ignoresMouseEvents = false
        self.isMovableByWindowBackground = true
        self.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary]
        self.contentView = hosting
        self.center()
    }
}
