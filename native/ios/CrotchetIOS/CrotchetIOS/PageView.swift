//
//  PageView.swift
//  CrotchetIOS
//
//  Created by Walter Kimaro on 08/08/2025.
//

import SwiftUI

struct PageView: View {
    let page: Page
    @EnvironmentObject private var themeProvider: ThemeProvider
    @EnvironmentObject private var navigationManager: NavigationManager
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                switch page.type {
                case .search:
                    SearchPageContent()
                case .detail:
                    DetailPageContent()
                case .form:
                    FormPageContent()
                case .tabbed:
                    TabbedPageContent()
                }
            }
            .padding()
        }
        .navigationTitle(page.title ?? "Page")
        .navigationBarTitleDisplayMode(.large)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button(action: {
                    navigationManager.popToRoot()
                }) {
                    Image(systemName: "house")
                }
            }
        }
    }
}

struct SearchPageContent: View {
    @State private var searchQuery = ""
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(.secondary)
                TextField("Search...", text: $searchQuery)
            }
            .padding()
            .background(Color(UIColor.secondarySystemBackground))
            .cornerRadius(10)
            
            Text("Search results will appear here")
                .foregroundColor(.secondary)
                .frame(maxWidth: .infinity, alignment: .center)
                .padding(.top, 40)
        }
    }
}

struct DetailPageContent: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Detail View")
                .font(.title2)
                .bold()
            
            Text("This is a detail page that would show specific content related to the selected action.")
                .foregroundColor(.secondary)
            
            Spacer()
        }
    }
}

struct FormPageContent: View {
    @State private var textInput = ""
    @State private var toggleValue = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            Text("Form")
                .font(.title2)
                .bold()
            
            VStack(alignment: .leading, spacing: 8) {
                Text("Text Input")
                    .font(.caption)
                    .foregroundColor(.secondary)
                TextField("Enter text", text: $textInput)
                    .textFieldStyle(.roundedBorder)
            }
            
            Toggle("Enable Option", isOn: $toggleValue)
            
            Button(action: {
                print("Form submitted")
            }) {
                Text("Submit")
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.accentColor)
                    .foregroundColor(.white)
                    .cornerRadius(10)
            }
            
            Spacer()
        }
    }
}

struct TabbedPageContent: View {
    @State private var selectedTab = 0
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Picker("", selection: $selectedTab) {
                Text("Tab 1").tag(0)
                Text("Tab 2").tag(1)
                Text("Tab 3").tag(2)
            }
            .pickerStyle(.segmented)
            
            switch selectedTab {
            case 0:
                Text("Content for Tab 1")
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding(.top, 40)
            case 1:
                Text("Content for Tab 2")
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding(.top, 40)
            case 2:
                Text("Content for Tab 3")
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding(.top, 40)
            default:
                EmptyView()
            }
            
            Spacer()
        }
    }
}