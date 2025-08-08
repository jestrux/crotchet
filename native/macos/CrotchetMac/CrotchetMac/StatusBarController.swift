//
//  StatusBarController.swift
//  CrotchetMac
//
//  Created by Walter Kimaro on 08/08/2025.
//

import Cocoa

final class StatusBarController {
    private var statusItem: NSStatusItem?

    init() {
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        if let button = statusItem?.button {
            button.title = "⌘C"
            button.action = #selector(toggleOverlay)
            button.target = self
        }
        let menu = NSMenu()
        
        let showHideItem = NSMenuItem(title: "Show/Hide", action: #selector(toggleOverlay), keyEquivalent: "")
        showHideItem.target = self
        menu.addItem(showHideItem)
        
        menu.addItem(.separator())
        
        let quitItem = NSMenuItem(title: "Quit", action: #selector(quit), keyEquivalent: "q")
        quitItem.target = self
        menu.addItem(quitItem)
        
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