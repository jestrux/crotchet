//
//  OverlayWindowController.swift
//  CrotchetMac
//
//  Created by Walter Kimaro on 08/08/2025.
//

import AppKit
import SwiftUI

class NonActivatingWindow: NSWindow {
    override var canBecomeKey: Bool {
        return true
    }
    
    override var canBecomeMain: Bool {
        return false
    }
}

class OverlayWindowController: NSObject {
    private var window: NSWindow?
    private var hostingController: NSHostingController<AnyView>?
    private var eventMonitor: Any?
    
    override init() {
        super.init()
        setupWindow()
    }
    
    private func setupWindow() {
        let contentView = CommandPaletteView()
            .environmentObject(ThemeProvider.shared)
            .environmentObject(Preferences.shared)
        
        hostingController = NSHostingController(rootView: AnyView(contentView))
        
        window = NonActivatingWindow(
            contentRect: NSRect(x: 0, y: 0, width: 600, height: 400),
            styleMask: [NSWindow.StyleMask.borderless, NSWindow.StyleMask.nonactivatingPanel],
            backing: NSWindow.BackingStoreType.buffered,
            defer: false
        )
        
        window?.level = .floating
        window?.isOpaque = false
        window?.backgroundColor = .clear
        window?.hasShadow = true
        window?.contentView = hostingController?.view
        window?.isReleasedWhenClosed = false
        window?.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary, .stationary]
        window?.hidesOnDeactivate = false
        
        // Center window on screen
        if let screen = NSScreen.main {
            let screenRect = screen.visibleFrame
            let windowWidth: CGFloat = 600
            let windowHeight: CGFloat = 400
            let x = screenRect.midX - windowWidth / 2
            let y = screenRect.midY - windowHeight / 2 + 100 // Slightly above center
            window?.setFrame(NSRect(x: x, y: y, width: windowWidth, height: windowHeight), display: false)
        }
    }
    
    func show() {
        // Don't activate the app or steal focus
        window?.orderFrontRegardless()
        
        // Make it key window without activating the app
        window?.makeKey()
        
        // Focus the window and make it first responder
        window?.makeFirstResponder(hostingController?.view)
        
        // Monitor for clicks outside the window
        eventMonitor = NSEvent.addGlobalMonitorForEvents(matching: .leftMouseDown) { [weak self] _ in
            self?.hide()
        }
    }
    
    func hide() {
        window?.orderOut(nil)
        
        if let monitor = eventMonitor {
            NSEvent.removeMonitor(monitor)
            eventMonitor = nil
        }
    }
    
    func toggle() {
        if window?.isVisible ?? false {
            hide()
        } else {
            show()
        }
    }
}