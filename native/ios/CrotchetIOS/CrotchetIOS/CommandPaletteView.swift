//
//  CommandPaletteView.swift
//  CrotchetIOS
//
//  Created by Walter Kimaro on 08/08/2025.
//

import SwiftUI

struct CommandPaletteView: View {
    @EnvironmentObject private var themeProvider: ThemeProvider
    @EnvironmentObject private var navigationManager: NavigationManager
    @State private var searchText = ""
    @FocusState private var isSearchFocused: Bool
    
    // Mock data for now
    private let mockActions = [
        Action(id: "1", name: "New Note", label: "Create a new note"),
        Action(id: "2", name: "Search", label: "Search all content"),
        Action(id: "3", name: "Settings", label: "Open settings"),
        Action(id: "4", name: "Help", label: "Show help documentation"),
        Action(id: "5", name: "Saved Items", label: "View your saved items"),
        Action(id: "6", name: "Recent", label: "Recently accessed items")
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
                    .submitLabel(.go)
                    .onSubmit {
                        if let firstAction = filteredActions.first {
                            executeAction(firstAction)
                        }
                    }
                
                if !searchText.isEmpty {
                    Button(action: { searchText = "" }) {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(.secondary)
                    }
                }
            }
            .padding()
            .background(Color(UIColor.secondarySystemBackground))
            
            // Results list
            List {
                ForEach(filteredActions, id: \.id) { action in
                    ActionRowIOS(action: action) {
                        executeAction(action)
                    }
                }
            }
            .listStyle(.plain)
        }
        .navigationTitle("Crotchet")
        .navigationBarTitleDisplayMode(.large)
        .onAppear {
            isSearchFocused = true
        }
    }
    
    private func executeAction(_ action: Action) {
        print("Executing action: \(action.name)")
        
        // Navigate to a mock page
        let page = Page(
            id: UUID().uuidString,
            type: .detail,
            title: action.name
        )
        navigationManager.push(page)
    }
}

struct ActionRowIOS: View {
    let action: Action
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(action.name)
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(.primary)
                    
                    if !action.label.isEmpty {
                        Text(action.label)
                            .font(.system(size: 14))
                            .foregroundColor(.secondary)
                    }
                }
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .font(.system(size: 14))
                    .foregroundColor(Color(UIColor.tertiaryLabel))
            }
            .padding(.vertical, 8)
        }
        .buttonStyle(.plain)
    }
}