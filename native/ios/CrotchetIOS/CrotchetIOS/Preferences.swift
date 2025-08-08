//
//  Preferences.swift
//  CrotchetIOS
//
//  Created by Walter Kimaro on 08/08/2025.
//

import Foundation
import Combine

enum HotkeyPreference: String, CaseIterable, Codable {
    case optionSlash
}

final class Preferences: ObservableObject {
    static let shared = Preferences()
    
    private enum Keys {
        static let hotkey = "hotkeyPreference"
    }

    @Published var hotkeyPreference: HotkeyPreference {
        didSet { save() }
    }

    init() {
        if let saved = UserDefaults.standard.string(forKey: Keys.hotkey),
           let pref = HotkeyPreference(rawValue: saved) {
            hotkeyPreference = pref
        } else {
            hotkeyPreference = .optionSlash
        }
    }

    private func save() {
        UserDefaults.standard.set(hotkeyPreference.rawValue, forKey: Keys.hotkey)
    }
}