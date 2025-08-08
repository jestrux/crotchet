//
//  GlobalHotkeyManager.swift
//  CrotchetMac
//
//  Created by Walter Kimaro on 08/08/2025.
//

import Cocoa
import Carbon.HIToolbox
import Combine

final class GlobalHotkeyManager: ObservableObject {
    private var eventTap: CFMachPort?
    private var runLoopSource: CFRunLoopSource?
    private var keyPtr: UnsafeMutablePointer<UInt16>?

    @Published var preference: HotkeyPreference = .optionSlash

    private var cancellables: Set<AnyCancellable> = []

    func start() { installTap() }
    func stop() { removeTap() }
    private func restart() { removeTap(); installTap() }

    private func installTap() {
        guard eventTap == nil else { return }
        let mask = (1 << CGEventType.keyDown.rawValue) | (1 << CGEventType.flagsChanged.rawValue)
        let wantedKey: UInt16 = 44 // kVK_ANSI_Slash

        // Allocate stable memory for refcon
        keyPtr = .allocate(capacity: 1)
        keyPtr?.initialize(to: wantedKey)

        if let tap = CGEvent.tapCreate(
            tap: .cgSessionEventTap,
            place: .headInsertEventTap,
            options: .defaultTap,
            eventsOfInterest: CGEventMask(mask),
            callback: { (_, type, event, refcon) -> Unmanaged<CGEvent>? in
                guard let refcon = refcon else { return Unmanaged.passUnretained(event) }
                let wantedKey = refcon.assumingMemoryBound(to: UInt16.self).pointee
                let keyCode = event.getIntegerValueField(.keyboardEventKeycode)
                let flags = event.flags
                
                if type == .keyDown {
                    if UInt16(keyCode) == wantedKey && flags.contains(.maskAlternate) {
                        // Option + / pressed - trigger overlay
                        NotificationCenter.default.post(name: .toggleOverlay, object: nil)
                        return nil // Consume the event to prevent typing '/'
                    }
                }
                return Unmanaged.passUnretained(event)
            },
            userInfo: UnsafeMutableRawPointer(keyPtr)
        ) {
            eventTap = tap
            runLoopSource = CFMachPortCreateRunLoopSource(kCFAllocatorDefault, tap, 0)
            if let source = runLoopSource {
                CFRunLoopAddSource(CFRunLoopGetMain(), source, .commonModes)
                CGEvent.tapEnable(tap: tap, enable: true)
            }
        }
    }

    private func removeTap() {
        if let tap = eventTap { CGEvent.tapEnable(tap: tap, enable: false) }
        if let source = runLoopSource { CFRunLoopRemoveSource(CFRunLoopGetMain(), source, .commonModes) }
        runLoopSource = nil
        eventTap = nil
        if let keyPtr {
            keyPtr.deinitialize(count: 1)
            keyPtr.deallocate()
            self.keyPtr = nil
        }
    }

    deinit { stop() }
}