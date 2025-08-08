import SwiftUI
import CrotchetShared

@main
struct CrotchetIOSApp: App {
    @StateObject private var theme = ThemeProvider()
    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(theme)
        }
    }
}

struct RootView: View {
    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 8) {
                Text("Crotchet iOS (Native) Scaffold")
                    .font(.headline)
                Text("Share Extension + Remote Controller to be added.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            .padding(16)
            .navigationTitle("Crotchet")
        }
    }
}
