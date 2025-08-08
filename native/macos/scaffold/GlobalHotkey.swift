import Cocoa
import Carbon.HIToolbox
import Combine
import CrotchetShared

final class GlobalHotkeyManager: ObservableObject {
    private var eventTap: CFMachPort?
    private var runLoopSource: CFRunLoopSource?
    private var keyPtr: UnsafeMutablePointer<UInt16>?

    @Published var preference: HotkeyPreference = .capsLock {
        didSet { restart() }
    }

    func configure(with preferences: Preferences) {
        self.preference = preferences.hotkey
        preferences.$hotkey
            .sink { [weak self] newValue in self?.preference = newValue }
            .store(in: &cancellables)
    }

    private var cancellables: Set<AnyCancellable> = []

    func start() { installTap() }
    func stop() { removeTap() }
    private func restart() { removeTap(); installTap() }

    private func installTap() {
        guard eventTap == nil else { return }
        let mask = (1 << CGEventType.keyDown.rawValue) | (1 << CGEventType.flagsChanged.rawValue)
        let wantedKey: UInt16 = {
            switch preference {
            case .capsLock: return UInt16(kVK_CapsLock)
            case .optionSlash: return 44 // kVK_ANSI_Slash
            }
        }()

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
                if type == .keyDown || type == .flagsChanged {
                    if UInt16(keyCode) == wantedKey {
                        if wantedKey == UInt16(kVK_CapsLock) {
                            NotificationCenter.default.post(name: .toggleOverlay, object: nil)
                            return Unmanaged.passUnretained(event) // pass through so Caps state toggles
                        } else if wantedKey == 44 { // Slash
                            if flags.contains(.maskAlternate) && type == .keyDown {
                                NotificationCenter.default.post(name: .toggleOverlay, object: nil)
                                return nil // swallow to avoid typing '/'
                            }
                        }
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
