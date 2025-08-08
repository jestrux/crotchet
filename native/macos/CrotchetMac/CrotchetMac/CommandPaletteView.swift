//
//  CommandPaletteView.swift
//  CrotchetMac
//
//  Created by Walter Kimaro on 08/08/2025.
//

import SwiftUI

struct CommandPaletteView: View {
    @EnvironmentObject private var themeProvider: ThemeProvider
    @State private var searchText = ""
    @State private var selectedIndex = 0
    @FocusState private var isSearchFocused: Bool
    
    // Mock data for now
    private let mockActions = [
        Action(id: "1", name: "New Note", label: "Create a new note"),
        Action(id: "2", name: "Search", label: "Search all content"),
        Action(id: "3", name: "Settings", label: "Open settings"),
        Action(id: "4", name: "Help", label: "Show help documentation")
    ]
    
    private var filteredActions: [Action] {
        if searchText.isEmpty {
            return mockActions
        }
        return mockActions.filter { action in
            action.name.localizedCaseInsensitiveContains(searchText) ||
            action.label.localizedCaseInsensitiveContains(searchText)
        }
    }
    
    var body: some View {
        VStack(spacing: 0) {
            // Search bar
            HStack {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(.secondary)
                
                TextField("Type a command...", text: $searchText)
                    .textFieldStyle(.plain)
                    .focused($isSearchFocused)
                    .onSubmit {
                        executeSelectedAction()
                    }
                
                if !searchText.isEmpty {
                    Button(action: { searchText = "" }) {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(.secondary)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding()
            .background(Color(NSColor.controlBackgroundColor))
            
            Divider()
            
            // Results list
            ScrollView {
                VStack(spacing: 2) {
                    ForEach(Array(filteredActions.enumerated()), id: \.element.id) { index, action in
                        ActionRow(
                            action: action,
                            isSelected: index == selectedIndex
                        )
                        .onTapGesture {
                            selectedIndex = index
                            executeSelectedAction()
                        }
                    }
                }
                .padding(.vertical, 4)
            }
            .background(Color(NSColor.windowBackgroundColor))
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(VisualEffectView())
        .cornerRadius(12)
        .onAppear {
            // Focus the search field when the palette opens
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                isSearchFocused = true
            }
        }
        .onExitCommand {
            // Close palette on Escape key
            NotificationCenter.default.post(name: .toggleOverlay, object: nil)
        }
        .onKeyPress(.escape) {
            // Also handle Escape key press
            NotificationCenter.default.post(name: .toggleOverlay, object: nil)
            return .handled
        }
    }
    
    private func executeSelectedAction() {
        guard filteredActions.indices.contains(selectedIndex) else { return }
        let action = filteredActions[selectedIndex]
        print("Executing action: \(action.name)")
        // TODO: Implement action execution
        NotificationCenter.default.post(name: .toggleOverlay, object: nil)
    }
}

struct ActionRow: View {
    let action: Action
    let isSelected: Bool
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(action.name)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(isSelected ? .white : .primary)
                
                if !action.label.isEmpty {
                    Text(action.label)
                        .font(.system(size: 12))
                        .foregroundColor(isSelected ? .white.opacity(0.8) : .secondary)
                }
            }
            
            Spacer()
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(
            isSelected ? Color.accentColor : Color.clear
        )
        .cornerRadius(6)
        .padding(.horizontal, 8)
    }
}

struct VisualEffectView: NSViewRepresentable {
    func makeNSView(context: Context) -> NSVisualEffectView {
        let view = NSVisualEffectView()
        view.material = .hudWindow
        view.blendingMode = .behindWindow
        view.state = .active
        return view
    }
    
    func updateNSView(_ nsView: NSVisualEffectView, context: Context) {}
}