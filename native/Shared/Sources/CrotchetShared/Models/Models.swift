import Foundation

public struct Action: Identifiable, Codable, Hashable {
    public let id: String
    public let name: String
    public let label: String
    public init(id: String, name: String, label: String) {
        self.id = id
        self.name = name
        self.label = label
    }
}

public struct Page: Identifiable, Codable, Hashable {
    public enum PageType: String, Codable, Hashable { case search, detail, form, tabbed }
    public let id: String
    public let type: PageType
    public let title: String?
    public init(id: String, type: PageType, title: String? = nil) {
        self.id = id
        self.type = type
        self.title = title
    }
}
