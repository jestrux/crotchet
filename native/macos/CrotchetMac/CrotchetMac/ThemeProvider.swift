//
//  ThemeProvider.swift
//  CrotchetMac
//
//  Created by Walter Kimaro on 08/08/2025.
//

import SwiftUI
import AppKit

final class ThemeProvider: ObservableObject {
    static let shared = ThemeProvider()
    
    @Published var isDark: Bool
    @Published var accentColor: Color = .blue
    
    var colorScheme: ColorScheme? {
        return isDark ? .dark : .light
    }
    
    init(isDark: Bool = false) { 
        self.isDark = isDark
    }
    
    func updateSystemAppearance() {
        DispatchQueue.main.async { [weak self] in
            if let app = NSApplication.shared as NSApplication? {
                self?.isDark = app.effectiveAppearance.name == .darkAqua
            } else {
                // Fallback to UserDefaults check
                self?.isDark = UserDefaults.standard.string(forKey: "AppleInterfaceStyle") == "Dark"
            }
        }
    }
}

struct ThemeTokens {
    static let canvas = Color("Canvas")
    static let card = Color("Card")
    static let content = Color("Content")
    static let primary = Color("Primary")
}