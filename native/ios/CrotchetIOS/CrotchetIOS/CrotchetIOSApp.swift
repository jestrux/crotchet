//
//  CrotchetIOSApp.swift
//  CrotchetIOS
//
//  Created by Walter Kimaro on 08/08/2025.
//

import SwiftUI

@main
struct CrotchetIOSApp: App {
    @StateObject private var themeProvider = ThemeProvider.shared
    @StateObject private var preferences = Preferences.shared
    @StateObject private var navigationManager = NavigationManager()
    
    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(themeProvider)
                .environmentObject(preferences)
                .environmentObject(navigationManager)
                .preferredColorScheme(themeProvider.colorScheme)
        }
    }
}
