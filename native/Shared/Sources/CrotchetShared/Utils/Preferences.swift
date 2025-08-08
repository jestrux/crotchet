import Foundation
import Combine

public enum HotkeyPreference: String, CaseIterable, Codable {
    case capsLock
    case optionSlash
}

public final class Preferences: ObservableObject {
    public static let shared = Preferences()
    
    private enum Keys {
        static let hotkey = "hotkeyPreference"
    }

    @Published public var hotkeyPreference: HotkeyPreference {
        didSet { save() }
    }

    public init() {
        if let saved = UserDefaults.standard.string(forKey: Keys.hotkey),
           let pref = HotkeyPreference(rawValue: saved) {
            hotkeyPreference = pref
        } else {
            hotkeyPreference = .capsLock
        }
    }

    private func save() {
        UserDefaults.standard.set(hotkeyPreference.rawValue, forKey: Keys.hotkey)
    }
}
