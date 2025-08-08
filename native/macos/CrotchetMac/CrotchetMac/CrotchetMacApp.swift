//
//  CrotchetMacApp.swift
//  CrotchetMac
//
//  Created by Walter Kimaro on 08/08/2025.
//

import SwiftUI

@main
struct CrotchetMacApp: App {
    @StateObject private var themeProvider = ThemeProvider.shared
    @StateObject private var preferences = Preferences.shared
    
    @State private var statusBarController: StatusBarController?
    @State private var hotkeyManager: GlobalHotkeyManager?
    @State private var overlayWindowController: OverlayWindowController?
    
    var body: some Scene {
        // Hidden window to keep app alive
        WindowGroup {
            EmptyView()
                .frame(width: 0, height: 0)
                .hidden()
                .onAppear {
                    // Delay initialization to avoid CGS errors
                    DispatchQueue.main.async {
                        initializeApp()
                    }
                }
        }
        .windowStyle(.hiddenTitleBar)
    }
    
    private func initializeApp() {
        // Hide dock icon and make it a menu bar app
        NSApp.setActivationPolicy(.accessory)
        
        // Update theme
        themeProvider.updateSystemAppearance()
        
        // Setup notifications
        setupNotifications()
        
        // Initialize components after a brief delay
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
            statusBarController = StatusBarController()
            hotkeyManager = GlobalHotkeyManager()
            hotkeyManager?.start()
        }
        
        // Hide all windows
        NSApp.windows.forEach { $0.close() }
    }
    
    private func setupNotifications() {
        NotificationCenter.default.addObserver(
            forName: .toggleOverlay,
            object: nil,
            queue: .main
        ) { _ in
            toggleOverlay()
        }
    }
    
    private func toggleOverlay() {
        if overlayWindowController == nil {
            overlayWindowController = OverlayWindowController()
        }
        overlayWindowController?.toggle()
    }
}
