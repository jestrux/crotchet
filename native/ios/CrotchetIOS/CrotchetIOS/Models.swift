//
//  Models.swift
//  CrotchetIOS
//
//  Created by Walter Kimaro on 08/08/2025.
//

import Foundation

struct Action: Identifiable, Codable, Hashable {
    let id: String
    let name: String
    let label: String
    
    init(id: String, name: String, label: String) {
        self.id = id
        self.name = name
        self.label = label
    }
}

struct Page: Identifiable, Codable, Hashable {
    enum PageType: String, Codable, Hashable { 
        case search, detail, form, tabbed 
    }
    
    let id: String
    let type: PageType
    let title: String?
    
    init(id: String, type: PageType, title: String? = nil) {
        self.id = id
        self.type = type
        self.title = title
    }
}