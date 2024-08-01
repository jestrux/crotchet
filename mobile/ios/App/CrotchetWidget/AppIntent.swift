//
//  AppIntent.swift
//  CrotchetWidget
//
//  Created by Walter Kimaro on 09/05/2024.
//

import WidgetKit
import AppIntents

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

struct ConfigurationAppIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "Data source"
    static var description = IntentDescription("Select data source")

    @Parameter(title: "Data source")
    var dataSource: WidgetDataSource?
    
    @Parameter(title: "View")
    var view: WidgetView
}
