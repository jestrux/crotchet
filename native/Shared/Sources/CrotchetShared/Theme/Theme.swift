import SwiftUI
#if os(macOS)
import AppKit
#endif

public final class ThemeProvider: ObservableObject {
    public static let shared = ThemeProvider()
    
    @Published public var isDark: Bool
    @Published public var accentColor: Color = .blue
    
    public var colorScheme: ColorScheme? {
        return isDark ? .dark : .light
    }
    
    public init(isDark: Bool = false) { 
        self.isDark = isDark
        // Don't call updateSystemAppearance during init to avoid NSApp crashes
    }
    
    public func updateSystemAppearance() {
        #if os(macOS)
        // Check if NSApp is available
        DispatchQueue.main.async { [weak self] in
            if let app = NSApplication.shared as NSApplication? {
                self?.isDark = app.effectiveAppearance.name == .darkAqua
            } else {
                // Fallback to UserDefaults check
                self?.isDark = UserDefaults.standard.string(forKey: "AppleInterfaceStyle") == "Dark"
            }
        }
        #endif
    }
}

public struct ThemeTokens {
    public static let canvas = Color("Canvas")
    public static let card = Color("Card")
    public static let content = Color("Content")
    public static let primary = Color("Primary")
}
