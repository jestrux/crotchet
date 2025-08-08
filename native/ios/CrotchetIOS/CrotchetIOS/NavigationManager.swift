//
//  NavigationManager.swift
//  CrotchetIOS
//
//  Created by Walter Kimaro on 08/08/2025.
//

import SwiftUI

class NavigationManager: ObservableObject {
    @Published var navigationPath = NavigationPath()
    @Published var currentPage: Page?
    
    func push(_ page: Page) {
        currentPage = page
        navigationPath.append(page)
    }
    
    func pop() {
        if !navigationPath.isEmpty {
            navigationPath.removeLast()
        }
    }
    
    func popToRoot() {
        navigationPath = NavigationPath()
        currentPage = nil
    }
}
