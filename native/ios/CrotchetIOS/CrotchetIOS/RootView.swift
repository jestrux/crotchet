//
//  RootView.swift
//  CrotchetIOS
//
//  Created by Walter Kimaro on 08/08/2025.
//

import SwiftUI

struct RootView: View {
    @EnvironmentObject private var navigationManager: NavigationManager
    @EnvironmentObject private var themeProvider: ThemeProvider
    
    var body: some View {
        NavigationStack(path: $navigationManager.navigationPath) {
            CommandPaletteView()
                .navigationDestination(for: Page.self) { page in
                    PageView(page: page)
                }
        }
    }
}