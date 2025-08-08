//
//  ThemeProvider.swift
//  CrotchetIOS
//
//  Created by Walter Kimaro on 08/08/2025.
//

import SwiftUI

final class ThemeProvider: ObservableObject {
    static let shared = ThemeProvider()
    
    @Published var isDark: Bool
    @Published var accentColor: Color = .blue
    
    var colorScheme: ColorScheme? {
        return isDark ? .dark : .light
    }
    
    init(isDark: Bool = false) { 
        self.isDark = isDark
        updateSystemAppearance()
    }
    
    func updateSystemAppearance() {
        // For iOS, check the current user interface style
        isDark = UIScreen.main.traitCollection.userInterfaceStyle == .dark
    }
}

struct ThemeTokens {
    static let canvas = Color("Canvas")
    static let card = Color("Card")
    static let content = Color("Content")
    static let primary = Color("Primary")
}