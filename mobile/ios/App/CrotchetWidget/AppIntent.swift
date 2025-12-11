//
//  AppIntent.swift
//  CrotchetWidget
//
//  Created by Walter Kimaro on 09/05/2024.
//

import WidgetKit
import AppIntents

// MARK: - Template Enum (must be before intents)

enum CrotchetTemplateAppEnum: String, AppEnum {
    case defaultTemplate = "Default"
    case highlight = "Highlight"
    case person = "Person"

    static var typeDisplayRepresentation = TypeDisplayRepresentation(name: "Template")
    static var caseDisplayRepresentations: [CrotchetTemplateAppEnum: DisplayRepresentation] = [
        .defaultTemplate: "Default",
        .highlight: "Highlight",
        .person: "Person"
    ]
}

// MARK: - Data Source Entity

struct WidgetDataSource: AppEntity {
    var id: String
    
    static var typeDisplayRepresentation: TypeDisplayRepresentation = "Widget Color"
    static var defaultQuery = WidgetDataSourceQuery ()

    var displayRepresentation: DisplayRepresentation {
        DisplayRepresentation (title: "\(id)")
    }
}

struct WidgetDataSourceQuery: EntityQuery {
    func getSources() ->[WidgetDataSource] {
        let sharedDefaults = UserDefaults.init(suiteName: "group.tz.co.crotchet")

        if(sharedDefaults != nil) {
            let sources = sharedDefaults?.string(forKey: "dataSources") ?? ""
            return sources.split(separator: ", ").map { WidgetDataSource(id: String($0)) }
        }
        
        return []
    }
        
    func entities(for identifiers: [WidgetDataSource.ID]) async throws -> [WidgetDataSource] {
        getSources().filter {
            identifiers.contains($0.id)
        }
    }

    func suggestedEntities() async throws -> [WidgetDataSource] {
        getSources()
    }

    func defaultResult() async -> WidgetDataSource? {
        nil
    }
}

struct WidgetView: AppEntity {
    var id: String
    
    static var typeDisplayRepresentation: TypeDisplayRepresentation = "Widget View"
    static var defaultQuery = WidgetViewQuery ()

    var displayRepresentation: DisplayRepresentation {
        DisplayRepresentation (title: "\(id)")
    }
}

struct WidgetViewQuery: EntityQuery {
    func getSources() ->[WidgetView] {
        return [
            WidgetView(id: "Random"),
            WidgetView(id: "Latest"),
        ]
    }
        
    func entities(for identifiers: [WidgetView.ID]) async throws -> [WidgetView] {
        getSources().filter {
            identifiers.contains($0.id)
        }
    }

    func suggestedEntities() async throws -> [WidgetView] {
        getSources()
    }

    func defaultResult() async -> WidgetView? {
        WidgetView(id: "Latest")
    }
}

// MARK: - Template Configuration Intents

struct ConfigurationAppIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "Configuration"
    static var description = IntentDescription("Configure widget")

    @Parameter(title: "Data source")
    var dataSource: WidgetDataSource?

    @Parameter(title: "View")
    var view: WidgetView

    @Parameter(title: "Template", default: .defaultTemplate)
    var template: CrotchetTemplateAppEnum
}

struct ConfigurationHighlightAppIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "Configuration"
    static var description = IntentDescription("Configure widget")

    @Parameter(title: "Data source")
    var dataSource: WidgetDataSource?

    @Parameter(title: "View")
    var view: WidgetView

    @Parameter(title: "Template", default: .highlight)
    var template: CrotchetTemplateAppEnum
}

struct ConfigurationPersonAppIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "Configuration"
    static var description = IntentDescription("Configure widget")

    @Parameter(title: "Data source")
    var dataSource: WidgetDataSource?

    @Parameter(title: "View")
    var view: WidgetView

    @Parameter(title: "Template", default: .person)
    var template: CrotchetTemplateAppEnum
}

// MARK: - Actions Widget Intent (No Configuration Needed)

struct ConfigurationActionsAppIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "Actions"
    static var description = IntentDescription("Quick actions widget")
}

// Protocol to extract template from any intent type
protocol TemplateProviding {
    var template: CrotchetTemplateAppEnum { get }
    var dataSource: WidgetDataSource? { get }
    var view: WidgetView { get }
}

extension ConfigurationAppIntent: TemplateProviding {}
extension ConfigurationHighlightAppIntent: TemplateProviding {}
extension ConfigurationPersonAppIntent: TemplateProviding {}
