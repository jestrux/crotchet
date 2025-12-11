//
//  CrotchetWidget.swift
//  CrotchetWidget
//
//  Created by Walter Kimaro on 09/05/2024.
//

import WidgetKit
import SwiftUI
import AppIntents

// MARK: - Template Configuration

enum CrotchetWidgetTemplate: String, CaseIterable {
    case defaultTemplate = "Default"
    case highlight = "Highlight"
    case person = "Person"

    var displayName: String { rawValue }
}

// MARK: - Refresh Intent

struct RefreshRandomIntent: AppIntent {
    static var title: LocalizedStringResource = "Refresh Random"

    static var parameterSummary: some ParameterSummary {
        Summary("Refresh \(\.$source)")
    }

    @Parameter(title: "Source")
    var source: String

    @Parameter(title: "Widget Size")
    var widgetSize: String

    init(source: String, widgetSize: String) {
        self.source = source
        self.widgetSize = widgetSize
    }

    init() {
        self.source = ""
        self.widgetSize = ""
    }

    func perform() async throws -> some IntentResult {
        // Build URL to trigger Firebase notification
        var components = URLComponents(string: "https://backend.wakyj07.workers.dev/firebase/notify")!
        components.queryItems = [
            URLQueryItem(name: "topic", value: "widget-refresh-random"),
            URLQueryItem(name: "title", value: "Widget Refresh"),
            URLQueryItem(name: "body", value: "Refreshing \(source) data"),
            URLQueryItem(name: "data", value: "{\"type\":\"widget-refresh\",\"source\":\"\(source)\",\"widgetSize\":\"\(widgetSize)\"}"),
            URLQueryItem(name: "silent", value: "true")
        ]

        guard let url = components.url else {
            return .result()
        }

        // Make the network request
        let (_, _) = try await URLSession.shared.data(from: url)

        return .result()
    }
}

// MARK: - Main Provider with Shared Logic

struct Provider: AppIntentTimelineProvider {
    typealias Intent = ConfigurationAppIntent

    func placeholder(in context: Context) -> SimpleEntry {
        let isMediumWidget = context.family == .systemMedium

        if isMediumWidget {
            // Create 6 placeholder items
            let placeholderTitles = [
                "The Art of Modern Design",
                "Exploring New Horizons",
                "Creative Thinking Unleashed",
                "Journey Through Innovation",
                "Building Better Experiences",
                "Crafting Digital Excellence"
            ]
            let placeholderSubtitles = [
                "A deep dive into aesthetics",
                "Discovering possibilities",
                "Ideas that transform",
                "Stories of inspiration",
                "User-centered approach",
                "Quality meets simplicity"
            ]
            let placeholderImages = [
                "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
                "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
                "https://images.unsplash.com/photo-1499159058454-75067059248a?w=400",
                "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400",
                "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400",
                "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400"
            ]
            let placeholderItems = (0..<6).map { index in
                ItemData(
                    image: placeholderImages[index],
                    video: nil,
                    title: placeholderTitles[index],
                    subtitle: placeholderSubtitles[index],
                    url: nil,
                    _id: nil
                )
            }
            return SimpleEntry(date: Date(),
                             items: placeholderItems,
                             template: .defaultTemplate)
        } else {
            return SimpleEntry(date: Date(),
                             image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
                             title: "The Art of Modern Design",
                             subtitle: "A deep dive into aesthetics",
                             template: .defaultTemplate)
        }
    }

    func peoplePlaceholder(in context: Context) -> SimpleEntry {
        let peopleData = [
            ("https://images.unsplash.com/photo-1700156246325-65bbb9e1dc0d?w=150&h=150&fit=crop&crop=faces", "Judith Mbwana", "Designer"),
            ("https://images.unsplash.com/photo-1645736593932-2c877741fd6c?w=150&h=150&fit=crop&crop=faces", "Japhet Mlawa", "Developer"),
            ("https://images.unsplash.com/photo-1679480911476-3ee732578062?w=150&h=150&fit=crop&crop=faces", "Juma Hassan", "Engineer"),
            ("https://images.unsplash.com/photo-1653669486491-4061c06f5029?w=150&h=150&fit=crop&crop=faces", "Anna Kisanga", "Manager"),
            ("https://images.unsplash.com/photo-1707676602290-acfdedc6b41d?w=150&h=150&fit=crop&crop=faces", "Hamisi Ngowi", "Analyst"),
            ("https://images.unsplash.com/photo-1601576084861-5de423553c0f?w=150&h=150&fit=crop&crop=faces", "Peter Ngonyani", "Director")
        ]

        switch context.family {
        case .systemMedium:
            // Medium: 4 people in a row
            let placeholderItems = peopleData.prefix(4).map { (image, title, _) in
                ItemData(
                    image: image,
                    video: nil,
                    title: title,
                    subtitle: nil,
                    url: nil,
                    _id: nil
                )
            }
            return SimpleEntry(date: Date(),
                             items: Array(placeholderItems),
                             template: .person,
                             previewSourceName: "Team")
        case .systemLarge:
            // Large: 6 people in 3x2 grid with subtitles
            let placeholderItems = peopleData.map { (image, title, subtitle) in
                ItemData(
                    image: image,
                    video: nil,
                    title: title,
                    subtitle: subtitle,
                    url: nil,
                    _id: nil
                )
            }
            return SimpleEntry(date: Date(),
                             items: placeholderItems,
                             template: .person,
                             previewSourceName: "Team")
        default:
            // Small: single person
            return SimpleEntry(date: Date(),
                             image: peopleData[0].0,
                             title: peopleData[0].1,
                             template: .person,
                             previewSourceName: "Team")
        }
    }

    func snapshot(for configuration: ConfigurationAppIntent, in context: Context) async -> SimpleEntry {
        let template = CrotchetWidgetTemplate(rawValue: configuration.template.rawValue) ?? .defaultTemplate
        let isMediumWidget = context.family == .systemMedium

        // Show placeholder data in widget gallery
        if isMediumWidget {
            let placeholderTitles = [
                "The Art of Modern Design",
                "Exploring New Horizons",
                "Creative Thinking Unleashed",
                "Journey Through Innovation",
                "Building Better Experiences",
                "Crafting Digital Excellence"
            ]
            let placeholderSubtitles = [
                "A deep dive into aesthetics",
                "Discovering possibilities",
                "Ideas that transform",
                "Stories of inspiration",
                "User-centered approach",
                "Quality meets simplicity"
            ]
            let placeholderImages = [
                "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
                "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
                "https://images.unsplash.com/photo-1499159058454-75067059248a?w=400",
                "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400",
                "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400",
                "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400"
            ]
            let placeholderItems = (0..<6).map { index in
                ItemData(
                    image: placeholderImages[index],
                    video: nil,
                    title: placeholderTitles[index],
                    subtitle: placeholderSubtitles[index],
                    url: nil,
                    _id: nil
                )
            }
            return SimpleEntry(date: Date(),
                             items: placeholderItems,
                             template: template,
                             dataSource: configuration.dataSource,
                             view: configuration.view,
                             previewSourceName: "My Content")
        } else {
            return SimpleEntry(date: Date(),
                             image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
                             title: "The Art of Modern Design",
                             subtitle: "A deep dive into aesthetics",
                             template: template,
                             dataSource: configuration.dataSource,
                             view: configuration.view,
                             previewSourceName: "My Content")
        }
    }

    func timeline(for configuration: ConfigurationAppIntent, in context: Context) async -> Timeline<SimpleEntry> {
        let template = CrotchetWidgetTemplate(rawValue: configuration.template.rawValue) ?? .defaultTemplate
        var entries: [SimpleEntry] = []

        let sharedDefaults = UserDefaults.init(suiteName: "group.tz.co.crotchet")

        var image: String? = nil
        var video: String? = nil
        var title: String? = nil
        var subtitle: String? = nil
        var url: String? = nil
        var _id: String? = nil
        var items: [ItemData]? = nil

        // Determine if we should fetch list data based on widget family
        let isListWidget = context.family == .systemMedium || context.family == .systemLarge
        let viewId = isListWidget ? configuration.view.id + "List" : configuration.view.id

        if(sharedDefaults != nil) {
            if(configuration.dataSource != nil) {
                let sourceObject: String? = sharedDefaults?.string(forKey: configuration.dataSource!.id + viewId)

                if(sourceObject != nil) {
                    let jsonString = sourceObject!
                    let data = Data(jsonString.utf8)
                    do {
                        // Check if it's a list view (medium or large widget)
                        if isListWidget {
                            // Parse as array
                            if let array = try JSONSerialization.jsonObject(with: data, options: []) as? [[String: Any]] {
                                items = array.map { dict in
                                    ItemData(
                                        image: dict["image"] as? String ?? dict["video"] as? String,
                                        video: dict["video"] as? String,
                                        title: dict["title"] as? String,
                                        subtitle: dict["subtitle"] as? String,
                                        url: dict["url"] as? String,
                                        _id: dict["_id"] as? String
                                    )
                                }
                            }
                        } else {
                            // Parse as single object
                            if let dictionary = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] {
                                video = dictionary["video"] as? String
                                image = dictionary["image"] as? String
                                title = dictionary["title"] as? String
                                subtitle = dictionary["subtitle"] as? String
                                url = dictionary["url"] as? String
                                _id = dictionary["_id"] as? String
                            }
                        }
                    } catch let error as NSError {
                        print("Failed to load: \(error.localizedDescription)")
                    }
                }
            }
        }

        // Don't add placeholder items in timeline - let it show empty state
        // Placeholders are only for snapshot (widget gallery preview)

        let currentDate = Date()
        let entryDate = Calendar.current.date(byAdding: .minute, value: 5, to: currentDate)!
        let entry = SimpleEntry(date: entryDate,
                                video: video,
                                image: image, title: title, subtitle: subtitle,
                                url: url,
                                _id: _id,
                                items: items,
                                template: template,
                                dataSource: configuration.dataSource,
                                view: configuration.view)
        entries.append(entry)

        return Timeline(entries: entries, policy: .atEnd)
    }
}

// MARK: - Minimal Wrapper Providers

struct ProviderHighlight: AppIntentTimelineProvider {
    typealias Intent = ConfigurationHighlightAppIntent
    private let baseProvider = Provider()

    func placeholder(in context: Context) -> SimpleEntry {
        let isMediumWidget = context.family == .systemMedium

        if isMediumWidget {
            // Medium: 1 large + 3 small items
            let highlightData = [
                ("https://images.unsplash.com/photo-1618220179428-22790b461013?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1Njg3MDF8MHwxfHNlYXJjaHw3fHxkZWNvcnxlbnwwfHx8fDE3NjU0NjY1MTN8MA&ixlib=rb-4.1.0&q=80&w=400", "Modern Decor", true),
                ("https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", "Design Patterns", false),
                ("https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400", "Architecture", false),
                ("https://images.unsplash.com/photo-1499159058454-75067059248a?w=400", "Minimalism", false)
            ]
            let placeholderItems = highlightData.map { (image, title, isVideo) in
                ItemData(
                    image: image,
                    video: isVideo ? image : nil,
                    title: title,
                    subtitle: nil,
                    url: nil,
                    _id: nil
                )
            }
            return SimpleEntry(date: Date(),
                             items: placeholderItems,
                             template: .highlight,
                             previewSourceName: "Decor")
        } else {
            // Small: single edge-to-edge image
            return SimpleEntry(date: Date(),
                              video: "https://images.unsplash.com/photo-1618220179428-22790b461013?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1Njg3MDF8MHwxfHNlYXJjaHw3fHxkZWNvcnxlbnwwfHx8fDE3NjU0NjY1MTN8MA&ixlib=rb-4.1.0&q=80&w=400",
                              image: "https://images.unsplash.com/photo-1618220179428-22790b461013?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1Njg3MDF8MHwxfHNlYXJjaHw3fHxkZWNvcnxlbnwwfHx8fDE3NjU0NjY1MTN8MA&ixlib=rb-4.1.0&q=80&w=400",
                              template: .highlight,
                              previewSourceName: "Decor")
        }
    }

    func snapshot(for configuration: ConfigurationHighlightAppIntent, in context: Context) async -> SimpleEntry {
        return placeholder(in: context)
    }

    func timeline(for configuration: ConfigurationHighlightAppIntent, in context: Context) async -> Timeline<SimpleEntry> {
        let config = ConfigurationAppIntent()
        config.dataSource = configuration.dataSource
        config.view = configuration.view
        config.template = configuration.template
        let timeline = await baseProvider.timeline(for: config, in: context)
        let entries = timeline.entries.map { entry in
            SimpleEntry(date: entry.date, video: entry.video, image: entry.image,
                       title: entry.title, subtitle: entry.subtitle, url: entry.url,
                       _id: entry._id, items: entry.items, template: .highlight,
                       dataSource: configuration.dataSource, view: configuration.view,
                       previewSourceName: entry.previewSourceName)
        }
        return Timeline(entries: entries, policy: timeline.policy)
    }
}

struct ProviderPersonSmall: AppIntentTimelineProvider {
    typealias Intent = ConfigurationPersonAppIntent
    private let baseProvider = Provider()

    func placeholder(in context: Context) -> SimpleEntry {
        return baseProvider.peoplePlaceholder(in: context)
    }

    func snapshot(for configuration: ConfigurationPersonAppIntent, in context: Context) async -> SimpleEntry {
        return baseProvider.peoplePlaceholder(in: context)
    }

    func timeline(for configuration: ConfigurationPersonAppIntent, in context: Context) async -> Timeline<SimpleEntry> {
        let config = ConfigurationAppIntent()
        config.dataSource = configuration.dataSource
        config.view = configuration.view
        config.template = configuration.template
        let timeline = await baseProvider.timeline(for: config, in: context)
        let entries = timeline.entries.map { entry in
            SimpleEntry(date: entry.date, video: entry.video, image: entry.image,
                       title: entry.title, subtitle: entry.subtitle, url: entry.url,
                       _id: entry._id, items: entry.items, template: .person,
                       dataSource: configuration.dataSource, view: configuration.view,
                       previewSourceName: entry.previewSourceName)
        }
        return Timeline(entries: entries, policy: timeline.policy)
    }
}

// MARK: - Actions Widget Provider

struct ActionsEntry: TimelineEntry {
    let date: Date
}

struct ProviderActions: AppIntentTimelineProvider {
    typealias Entry = ActionsEntry
    typealias Intent = ConfigurationActionsAppIntent

    func placeholder(in context: Context) -> ActionsEntry {
        ActionsEntry(date: Date())
    }

    func snapshot(for configuration: ConfigurationActionsAppIntent, in context: Context) async -> ActionsEntry {
        ActionsEntry(date: Date())
    }

    func timeline(for configuration: ConfigurationActionsAppIntent, in context: Context) async -> Timeline<ActionsEntry> {
        let entry = ActionsEntry(date: Date())
        return Timeline(entries: [entry], policy: .never)
    }
}

struct ItemData {
    let image: String?
    let video: String?
    let title: String?
    let subtitle: String?
    let url: String?
    let _id: String?
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let image: String?
    let video: String?
    let title: String?
    let subtitle: String?
    let url: String?
    let _id: String?
    let items: [ItemData]?
    let template: CrotchetWidgetTemplate
    let dataSource: WidgetDataSource?
    let view: WidgetView?
    let previewSourceName: String?

    init(date: Date, video: String? = nil, image: String? = nil, title: String? = nil, subtitle: String? = nil, url: String? = nil, _id: String? = nil, items: [ItemData]? = nil, template: CrotchetWidgetTemplate = .defaultTemplate, dataSource: WidgetDataSource? = nil, view: WidgetView? = nil, previewSourceName: String? = nil) {
        self.date = date
        self.image = image ?? video
        self.video = video
        self.title = title
        self.subtitle = subtitle
        self.url = url
        self._id = _id
        self.items = items
        self.template = template
        self.dataSource = dataSource
        self.view = view
        self.previewSourceName = previewSourceName
    }
}

struct NetworkImage: View {
    var url: String?

    var body: some View {
        GeometryReader { geometry in
            Group {
                let image = URL(string: url ?? "some")!
                if let imageData = try? Data(contentsOf: image),
                   let uiImage = UIImage(data: imageData) {

                    Image(uiImage: uiImage)
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(width: geometry.size.width, height: geometry.size.height)
                        .clipped()
                }
                else {
                    Rectangle()
                        .fill(.foreground.opacity(0.1))
                }
            }
        }
    }
}

struct CrotchetWidgetEntryView : View {
    var entry: SimpleEntry

    @Environment(\.widgetFamily) var family

    var body: some View {
        // Switch rendering based on template and size
        switch (entry.template, family) {
        case (.defaultTemplate, .systemSmall):
            defaultSmallView()
        case (.defaultTemplate, .systemMedium):
            defaultMediumView()
        case (.highlight, .systemSmall):
            highlightSmallView()
        case (.highlight, .systemMedium):
            highlightMediumView()
        case (.person, .systemSmall):
            personSmallView()
        case (.person, .systemMedium):
            peopleMediumView()
        case (.person, .systemLarge):
            peopleLargeView()
        default:
            defaultSmallView()
        }
    }

    @ViewBuilder
    func image(url: String?) -> some View {
        let size = family == .systemMedium ? 90.0 : 60.0;

        if url != nil || entry.image != nil {
            let image = URL(string: url ?? entry.image!)!;
            let source = entry.dataSource;
            let slug = source == nil ? "" : "search/" + source!.id;
            
            Link(destination: URL(string: entry.url ?? "crotchet://" + slug)!) {
                Group {
                    if let imageData = try? Data(contentsOf: image),
                       let uiImage = UIImage(data: imageData) {
                        
                        Image(uiImage: uiImage)
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    }
                    else {
                        Rectangle()
                            .size(width: size, height: size)
                            .background(Color.gray)
                    }
                }
                .frame(width: size, height: size)
                .cornerRadius(10)
            }
        } else {
            EmptyView()
        }
    }
    
    func toTitleCase(text: String) -> String {
        var result = ""
        var previousCharWasCapitalized = false
        
        for (index, char) in text.enumerated() {
            var charStr = String(char)
            
            // If capital is found...
            if charStr == charStr.uppercased()
            {
                // ...lower case it...
                charStr = charStr.lowercased()
                
                // If it's not the first letter, nor follows another lowercased letter, prepend an underscore
                // (If it followed another operated-on letter, we'd get "JSON" -> "j_s_o_n" instead of "json")
                if
                    index != 0,
                    !previousCharWasCapitalized {
                    charStr = " " + charStr
                }
                previousCharWasCapitalized = true
            }
            // If capital is not found, mark it for the next cycle, and move on.
            else { previousCharWasCapitalized = false }
            
            result += charStr
        }
        
        return result
    }
    
    // MARK: - Default Template Views

    @ViewBuilder
    func defaultSmallView() -> some View {
        content(isSmall: true, isCompact: false)
    }

    @ViewBuilder
    func defaultMediumView() -> some View {
        content(isSmall: false, isCompact: false)
    }

    // MARK: - Person Template View (Small only)

    @ViewBuilder
    func personSmallView() -> some View {
        let source = entry.dataSource
        let noSource = source == nil && entry.previewSourceName == nil
        let searchPath = source != nil ? "crotchet://search/\(source!.id)" : "crotchet://"
        let searchUrl = URL(string: searchPath)!

        if noSource {
            // Show empty state (same as default)
            VStack(spacing: 12) {
                Spacer()
                Image(systemName: "square.dashed")
                    .font(.system(size: 48))
                    .foregroundColor(.secondary)
                    .opacity(0.4)
                VStack(spacing: 4) {
                    Text("SOURCE NOT SET")
                        .font(.system(size: 9))
                        .bold()
                        .opacity(0.3)
                    Text("Hold widget to\nselect source")
                        .font(.caption2)
                        .opacity(0.5)
                        .multilineTextAlignment(.center)
                }
                Spacer()
            }
            .frame(maxWidth: .infinity)
        } else {
            ZStack(alignment: .topTrailing) {
                // Main content - circular image with title below
                let url = entry.url != nil ? URL(string: entry.url!)! : searchUrl

                Link(destination: url) {
                    GeometryReader { geometry in
                        VStack(spacing: 6) {
                            // Circular image - compute size from available height
                            let availableHeight = geometry.size.height
                            let titleHeight: CGFloat = 16 // Approximate height for title text
                            let imageSpacing: CGFloat = 6 // Space below image
                            let titleBottomSpacing: CGFloat = 6 // Space below title
                            let imageSize = availableHeight - titleHeight - imageSpacing - titleBottomSpacing

                            if let imageUrl = entry.image {
                                let image = URL(string: imageUrl)!
                                Group {
                                    if let imageData = try? Data(contentsOf: image),
                                       let uiImage = UIImage(data: imageData) {
                                        ZStack {
                                            Image(uiImage: uiImage)
                                                .resizable()
                                                .aspectRatio(contentMode: .fill)
                                                .frame(width: imageSize, height: imageSize)
                                                .clipShape(Circle())

                                            if entry.video != nil {
                                                Circle()
                                                    .fill(.black.opacity(0.3))
                                                    .frame(width: imageSize, height: imageSize)
                                                Image(systemName: "play.circle.fill")
                                                    .font(.system(size: imageSize * 0.3))
                                                    .foregroundColor(.white)
                                            }
                                        }
                                    } else {
                                        Circle()
                                            .fill(.foreground.opacity(0.1))
                                            .frame(width: imageSize, height: imageSize)
                                    }
                                }
                            } else {
                                Circle()
                                    .fill(.foreground.opacity(0.1))
                                    .frame(width: imageSize, height: imageSize)
                            }

                            // Title below image
                            if let title = entry.title {
                                Text(title)
                                    .lineLimit(1)
                                    .font(.caption)
                                    .bold()
                                    .frame(maxWidth: .infinity)
                            }

                            Spacer(minLength: 0)
                        }
                        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
                    }
                }

                // Absolutely positioned button (top right) - swap based on view type
                if entry.view?.id == "Random", let src = source {
                    // Random view: show only refresh button
                    Button(intent: RefreshRandomIntent(source: src.id, widgetSize: "small")) {
                        Image(systemName: "arrow.triangle.2.circlepath")
                            .resizable()
                            .scaledToFit()
                            .frame(height: 12)
                    }
                    .tint(.secondary)
                    .clipShape(Circle())
                    .padding(.trailing, -10)
                } else {
                    // Latest view: show only search button
                    Link(destination: searchUrl) {
                        Button {
                        } label: {
                            Image(systemName: "magnifyingglass")
                                .resizable()
                                .scaledToFit()
                                .frame(height: 12)
                        }
                        .tint(.secondary)
                        .clipShape(Circle())
                    }
                    .padding(.trailing, -10)
                }
            }
        }
    }

    // MARK: - Highlight Template Views

    @ViewBuilder
    func highlightSmallView() -> some View {
        let source = entry.dataSource
        let noSource = source == nil && entry.previewSourceName == nil

        if noSource {
            // Show empty state (same as default)
            VStack(spacing: 12) {
                Spacer()
                Image(systemName: "square.dashed")
                    .font(.system(size: 48))
                    .foregroundColor(.secondary)
                    .opacity(0.4)
                VStack(spacing: 4) {
                    Text("SOURCE NOT SET")
                        .font(.system(size: 9))
                        .bold()
                        .opacity(0.3)
                    Text("Hold widget to\nselect source")
                        .font(.caption2)
                        .opacity(0.5)
                        .multilineTextAlignment(.center)
                }
                Spacer()
            }
            .frame(maxWidth: .infinity)
        } else {
            ZStack(alignment: .topTrailing) {
                // Edge-to-edge image that fills the entire widget
                if entry.image != nil {
                    let imageUrl = URL(string: entry.image!)!
                    let url = entry.url != nil ? URL(string: entry.url!)! : URL(string: "crotchet://")!

                    Link(destination: url) {
                        GeometryReader { geometry in
                            Group {
                                if let imageData = try? Data(contentsOf: imageUrl),
                                   let uiImage = UIImage(data: imageData) {
                                    ZStack {
                                        Image(uiImage: uiImage)
                                            .resizable()
                                            .aspectRatio(contentMode: .fill)
                                            .frame(width: geometry.size.width, height: geometry.size.height)
                                            .clipped()

                                        // Video play icon overlay
                                        if entry.video != nil {
                                            Rectangle()
                                                .fill(.black.opacity(0.3))
                                            Image(systemName: "play.circle.fill")
                                                .font(.system(size: 40))
                                                .foregroundColor(.white)
                                        }
                                    }
                                } else {
                                    Rectangle()
                                        .fill(.foreground.opacity(0.1))
                                }
                            }
                        }
                        .ignoresSafeArea()
                    }
                }

                // Refresh button overlay (top right)
                if entry.view?.id == "Random", let src = source {
                    Button(intent: RefreshRandomIntent(source: src.id, widgetSize: "small")) {
                        Image(systemName: "arrow.triangle.2.circlepath")
                            .resizable()
                            .scaledToFit()
                            .frame(height: 12)
                            .padding(8)
                            .background(Circle().fill(.ultraThinMaterial))
                    }
                    .tint(.secondary)
                    .padding(8)
                }
            }
        }
    }

    @ViewBuilder
    func highlightMediumView() -> some View {
        let source = entry.dataSource
        let noSource = source == nil && entry.previewSourceName == nil
        let sourceName = entry.previewSourceName ?? (source == nil ? "Source not set" : source!.id)
        let searchPath = source != nil ? "crotchet://search/\(sourceName)" : "crotchet://"
        let searchUrl = URL(string: searchPath)!

        VStack(alignment: .leading, spacing: 0) {
            // Header (same as default)
            HStack {
                Text(noSource ? "SOURCE NOT SET" : toTitleCase(text: sourceName).uppercased())
                    .font(.caption2)
                    .bold()
                    .opacity(noSource ? 0.3 : 0.5)
                Spacer()

                if source != nil || entry.previewSourceName != nil {
                    HStack(spacing: 0) {
                        // Show refresh button for Random view
                        if entry.view?.id == "Random", let src = source {
                            Button(intent: RefreshRandomIntent(source: src.id, widgetSize: "medium")) {
                                Image(systemName: "arrow.triangle.2.circlepath")
                                    .resizable()
                                    .scaledToFit()
                                    .frame(height: 12)
                            }
                            .tint(.secondary)
                            .clipShape(Circle())
                        }

                        Link(destination: searchUrl) {
                            Button {
                            } label: {
                                Image(systemName: "magnifyingglass")
                                    .resizable()
                                    .scaledToFit()
                                    .frame(height: 12)
                            }
                            .tint(.secondary)
                            .clipShape(Circle())
                        }
                    }
                }
            }
            .padding(.top, -8)
            .padding(.trailing, -10)

            if noSource {
                // Empty state
                VStack(spacing: 8) {
                    Spacer()
                    Image(systemName: "square.dashed")
                        .font(.system(size: 32))
                        .foregroundColor(.secondary)
                        .opacity(0.4)
                    Text("Hold widget to select source")
                        .font(.caption)
                        .opacity(0.5)
                        .multilineTextAlignment(.center)
                    Spacer()
                }
                .frame(maxWidth: .infinity)
            } else {
                let items = entry.items ?? []

                // Layout: 1 large item on left + 3 small items on right
                HStack(spacing: 8) {
                    // Large item on left (opens direct URL)
                    if items.count > 0 {
                        let largeItem = items[0]
                        let url = largeItem.url != nil ? URL(string: largeItem.url!)! : searchUrl

                        Link(destination: url) {
                            ZStack {
                                NetworkImage(url: largeItem.image)

                                if largeItem.video != nil {
                                    Rectangle()
                                        .fill(.black.opacity(0.3))
                                    Image(systemName: "play.circle.fill")
                                        .font(.system(size: 32))
                                        .foregroundColor(.white)
                                }
                            }
                            .cornerRadius(8)
                        }
                    }

                    // 3 small items on right (use source-entry links)
                    VStack(spacing: 0) {
                        ForEach(1..<4, id: \.self) { index in
                            if items.count > index {
                                let item = items[index]
                                let itemUrl: URL = {
                                    if let id = item._id, let src = source {
                                        return URL(string: "crotchet://source-entry/\(src.id)/\(id)")!
                                    } else {
                                        return searchUrl
                                    }
                                }()

                                Link(destination: itemUrl) {
                                    HStack(spacing: 6) {
                                        ZStack {
                                            NetworkImage(url: item.image)

                                            if item.video != nil {
                                                Rectangle()
                                                    .fill(.black.opacity(0.3))

                                                Image(systemName: "play.fill")
                                                    .font(.system(size: 14))
                                                    .foregroundColor(.white)
                                            }
                                        }
                                        .frame(width: 42, height: 36)
                                        .cornerRadius(4)

                                        VStack(alignment: .leading, spacing: 0) {
                                            if item.title != nil {
                                                Text(item.title!)
                                                    .lineLimit(1)
                                                    .font(.caption)
                                                    .frame(maxWidth: .infinity, alignment: .leading)
                                            }

                                            if item.subtitle != nil {
                                                Text(item.subtitle!)
                                                    .lineLimit(1)
                                                    .font(.caption2)
                                                    .opacity(0.5)
                                                    .frame(maxWidth: .infinity, alignment: .leading)
                                            }
                                        }
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                    }
                                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                                }
                                .frame(maxHeight: .infinity)
                            } else {
                                Rectangle()
                                    .fill(.foreground.opacity(0.05))
                                    .cornerRadius(4)
                                    .frame(maxHeight: .infinity)
                            }
                        }
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                }
                .padding(.top, 4)
                .padding(.bottom, -2)
                .frame(maxHeight: .infinity)
            }
        }
        .padding(16)
    }

    // MARK: - People Template Views

    @ViewBuilder
    func peopleMediumView() -> some View {
        let source = entry.dataSource
        let noSource = source == nil && entry.previewSourceName == nil
        let sourceName = entry.previewSourceName ?? (source == nil ? "Source not set" : source!.id)
        let searchPath = source != nil ? "crotchet://search/\(sourceName)" : "crotchet://"
        let searchUrl = URL(string: searchPath)!

        VStack(alignment: .leading, spacing: 0) {
            // Header
            HStack {
                Text(noSource ? "SOURCE NOT SET" : toTitleCase(text: sourceName).uppercased())
                    .font(.caption2)
                    .bold()
                    .opacity(noSource ? 0.3 : 0.5)
                Spacer()

                if source != nil || entry.previewSourceName != nil {
                    HStack(spacing: 0) {
                        // Show both refresh and search for Random view
                        if entry.view?.id == "Random", let src = source {
                            Button(intent: RefreshRandomIntent(source: src.id, widgetSize: "medium")) {
                                Image(systemName: "arrow.triangle.2.circlepath")
                                    .resizable()
                                    .scaledToFit()
                                    .frame(height: 12)
                            }
                            .tint(.secondary)
                            .clipShape(Circle())
                        }

                        Link(destination: searchUrl) {
                            Button {
                            } label: {
                                Image(systemName: "magnifyingglass")
                                    .resizable()
                                    .scaledToFit()
                                    .frame(height: 12)
                            }
                            .tint(.secondary)
                            .clipShape(Circle())
                        }
                    }
                }
            }
            .padding(.top, -8)
            .padding(.trailing, -10)

            if noSource {
                // Empty state
                VStack(spacing: 8) {
                    Spacer()
                    Image(systemName: "square.dashed")
                        .font(.system(size: 32))
                        .foregroundColor(.secondary)
                        .opacity(0.4)
                    Text("Hold widget to select source")
                        .font(.caption)
                        .opacity(0.5)
                        .multilineTextAlignment(.center)
                    Spacer()
                }
                .frame(maxWidth: .infinity)
            } else {
                let items = entry.items ?? []

                // Single row of 4 items - divide space equally
                HStack(alignment: .center, spacing: 8) {
                    ForEach(0..<4, id: \.self) { index in
                        if items.count > index {
                            let item = items[index]
                            let itemUrl: URL = {
                                if let id = item._id, let src = source {
                                    return URL(string: "crotchet://source-entry/\(src.id)/\(id)")!
                                } else {
                                    return searchUrl
                                }
                            }()

                            Link(destination: itemUrl) {
                                VStack(spacing: 4) {
                                    if let imageUrl = item.image {
                                        let image = URL(string: imageUrl)!
                                        Group {
                                            if let imageData = try? Data(contentsOf: image),
                                               let uiImage = UIImage(data: imageData) {
                                                ZStack {
                                                    Image(uiImage: uiImage)
                                                        .resizable()
                                                        .aspectRatio(1, contentMode: .fill)
                                                        .clipShape(Circle())

                                                    if item.video != nil {
                                                        Circle()
                                                            .fill(.black.opacity(0.3))
                                                        Image(systemName: "play.fill")
                                                            .font(.system(size: 14))
                                                            .foregroundColor(.white)
                                                    }
                                                }
                                                .aspectRatio(1, contentMode: .fit)
                                            } else {
                                                Circle()
                                                    .fill(.foreground.opacity(0.1))
                                                    .aspectRatio(1, contentMode: .fit)
                                            }
                                        }
                                    } else {
                                        Circle()
                                            .fill(.foreground.opacity(0.1))
                                            .aspectRatio(1, contentMode: .fit)
                                    }

                                    if let title = item.title {
                                        Text(title)
                                            .lineLimit(1)
                                            .font(.system(size: 10))
                                            .frame(maxWidth: .infinity)
                                    }
                                }
                                .padding(.horizontal, 4)
                            }
                            .frame(maxWidth: .infinity)
                        }
                    }
                }
                .padding(.top, 4)
                .padding(.bottom, -2)
                .frame(maxHeight: .infinity)
            }
        }
    }

    @ViewBuilder
    func peopleLargeView() -> some View {
        let source = entry.dataSource
        let noSource = source == nil && entry.previewSourceName == nil
        let sourceName = entry.previewSourceName ?? (source == nil ? "Source not set" : source!.id)
        let searchPath = source != nil ? "crotchet://search/\(sourceName)" : "crotchet://"
        let searchUrl = URL(string: searchPath)!

        VStack(alignment: .leading, spacing: 0) {
            // Header
            HStack {
                Text(noSource ? "SOURCE NOT SET" : toTitleCase(text: sourceName).uppercased())
                    .font(.caption2)
                    .bold()
                    .opacity(noSource ? 0.3 : 0.5)
                Spacer()

                if source != nil || entry.previewSourceName != nil {
                    HStack(spacing: 0) {
                        // Show both refresh and search for Random view
                        if entry.view?.id == "Random", let src = source {
                            Button(intent: RefreshRandomIntent(source: src.id, widgetSize: "large")) {
                                Image(systemName: "arrow.triangle.2.circlepath")
                                    .resizable()
                                    .scaledToFit()
                                    .frame(height: 12)
                            }
                            .tint(.secondary)
                            .clipShape(Circle())
                        }

                        Link(destination: searchUrl) {
                            Button {
                            } label: {
                                Image(systemName: "magnifyingglass")
                                    .resizable()
                                    .scaledToFit()
                                    .frame(height: 12)
                            }
                            .tint(.secondary)
                            .clipShape(Circle())
                        }
                    }
                }
            }
            .padding(.top, -8)
            .padding(.trailing, -10)

            if noSource {
                // Empty state
                VStack(spacing: 8) {
                    Spacer()
                    Image(systemName: "square.dashed")
                        .font(.system(size: 32))
                        .foregroundColor(.secondary)
                        .opacity(0.4)
                    Text("Hold widget to select source")
                        .font(.caption)
                        .opacity(0.5)
                        .multilineTextAlignment(.center)
                    Spacer()
                }
                .frame(maxWidth: .infinity)
            } else {
                let items = entry.items ?? []

                // 3 columns x 2 rows grid - divide space equally
                VStack(spacing: 8) {
                    // Row 1: items 0, 1, 2
                    HStack(alignment: .center, spacing: 8) {
                        ForEach(0..<3, id: \.self) { index in
                            let item = items.count > index ? items[index] : nil
                            let itemUrl: URL = {
                                if let id = item?._id, let src = source {
                                    return URL(string: "crotchet://source-entry/\(src.id)/\(id)")!
                                } else {
                                    return searchUrl
                                }
                            }()

                            Link(destination: itemUrl) {
                                VStack(spacing: 0) {
                                    if let imageUrl = item?.image {
                                        let image = URL(string: imageUrl)!
                                        Group {
                                            if let imageData = try? Data(contentsOf: image),
                                               let uiImage = UIImage(data: imageData) {
                                                ZStack {
                                                    Image(uiImage: uiImage)
                                                        .resizable()
                                                        .aspectRatio(1, contentMode: .fill)
                                                        .clipShape(Circle())

                                                    if item?.video != nil {
                                                        Circle()
                                                            .fill(.black.opacity(0.3))
                                                        Image(systemName: "play.fill")
                                                            .font(.system(size: 18))
                                                            .foregroundColor(.white)
                                                    }
                                                }
                                                .aspectRatio(1, contentMode: .fit)
                                            } else {
                                                Circle()
                                                    .fill(.foreground.opacity(0.1))
                                                    .aspectRatio(1, contentMode: .fit)
                                            }
                                        }
                                    } else {
                                        Circle()
                                            .fill(.foreground.opacity(0.1))
                                            .aspectRatio(1, contentMode: .fit)
                                    }

                                    if let title = item?.title {
                                        Text(title)
                                            .lineLimit(1)
                                            .font(.system(size: 11))
                                            .fontWeight(.medium)
                                            .frame(maxWidth: .infinity, alignment: .leading)
                                            .padding(.top, 6)
                                    }

                                    if let subtitle = item?.subtitle {
                                        Text(subtitle)
                                            .lineLimit(1)
                                            .font(.system(size: 10))
                                            .foregroundColor(.secondary)
                                            .frame(maxWidth: .infinity, alignment: .leading)
                                            .padding(.top, 3)
                                    }
                                }
                                .padding(.horizontal, 4)
                            }
                            .frame(maxWidth: .infinity)
                        }
                    }
                    .frame(maxHeight: .infinity)

                    // Row 2: items 3, 4, 5
                    HStack(alignment: .center, spacing: 8) {
                        ForEach(3..<6, id: \.self) { index in
                            let item = items.count > index ? items[index] : nil
                            let itemUrl: URL = {
                                if let id = item?._id, let src = source {
                                    return URL(string: "crotchet://source-entry/\(src.id)/\(id)")!
                                } else {
                                    return searchUrl
                                }
                            }()

                            Link(destination: itemUrl) {
                                VStack(spacing: 0) {
                                    if let imageUrl = item?.image {
                                        let image = URL(string: imageUrl)!
                                        Group {
                                            if let imageData = try? Data(contentsOf: image),
                                               let uiImage = UIImage(data: imageData) {
                                                ZStack {
                                                    Image(uiImage: uiImage)
                                                        .resizable()
                                                        .aspectRatio(1, contentMode: .fill)
                                                        .clipShape(Circle())

                                                    if item?.video != nil {
                                                        Circle()
                                                            .fill(.black.opacity(0.3))
                                                        Image(systemName: "play.fill")
                                                            .font(.system(size: 18))
                                                            .foregroundColor(.white)
                                                    }
                                                }
                                                .aspectRatio(1, contentMode: .fit)
                                            } else {
                                                Circle()
                                                    .fill(.foreground.opacity(0.1))
                                                    .aspectRatio(1, contentMode: .fit)
                                            }
                                        }
                                    } else {
                                        Circle()
                                            .fill(.foreground.opacity(0.1))
                                            .aspectRatio(1, contentMode: .fit)
                                    }

                                    if let title = item?.title {
                                        Text(title)
                                            .lineLimit(1)
                                            .font(.system(size: 11))
                                            .fontWeight(.medium)
                                            .frame(maxWidth: .infinity, alignment: .leading)
                                            .padding(.top, 6)
                                    }

                                    if let subtitle = item?.subtitle {
                                        Text(subtitle)
                                            .lineLimit(1)
                                            .font(.system(size: 10))
                                            .foregroundColor(.secondary)
                                            .frame(maxWidth: .infinity, alignment: .leading)
                                            .padding(.top, 3)
                                    }
                                }
                                .padding(.horizontal, 4)
                            }
                            .frame(maxWidth: .infinity)
                        }
                    }
                    .frame(maxHeight: .infinity)
                }
                .padding(.top, 4)
                .padding(.bottom, -2)
                .frame(maxHeight: .infinity)
            }
        }
    }

    @ViewBuilder
    func peopleGridItem(item: ItemData?, source: WidgetDataSource?, searchUrl: URL) -> some View {
        let itemUrl: URL = {
            if let id = item?._id, let src = source {
                return URL(string: "crotchet://source-entry/\(src.id)/\(id)")!
            } else {
                return searchUrl
            }
        }()

        Link(destination: itemUrl) {
            GeometryReader { geometry in
                VStack(spacing: 4) {
                    // Circular image - compute size from available height
                    let availableHeight = geometry.size.height
                    let titleHeight: CGFloat = 14 // Approximate height for title text
                    let spacing: CGFloat = 4
                    let imageSize = availableHeight - titleHeight - spacing

                    if let imageUrl = item?.image ?? entry.image {
                        let image = URL(string: imageUrl)!
                        Group {
                            if let imageData = try? Data(contentsOf: image),
                               let uiImage = UIImage(data: imageData) {
                                ZStack {
                                    Image(uiImage: uiImage)
                                        .resizable()
                                        .aspectRatio(contentMode: .fill)
                                        .frame(width: imageSize, height: imageSize)
                                        .clipShape(Circle())

                                    if item?.video != nil {
                                        Circle()
                                            .fill(.black.opacity(0.3))
                                            .frame(width: imageSize, height: imageSize)
                                        Image(systemName: "play.fill")
                                            .font(.system(size: imageSize * 0.3))
                                            .foregroundColor(.white)
                                    }
                                }
                            } else {
                                Circle()
                                    .fill(.foreground.opacity(0.1))
                                    .frame(width: imageSize, height: imageSize)
                            }
                        }
                    } else {
                        Circle()
                            .fill(.foreground.opacity(0.1))
                            .frame(width: imageSize, height: imageSize)
                    }

                    // Title
                    if let title = item?.title ?? entry.title {
                        Text(title)
                            .lineLimit(1)
                            .font(.system(size: 10))
                            .frame(maxWidth: .infinity)
                    }
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
            }
        }
    }

    // MARK: - Shared Content Logic

    @ViewBuilder
    func content(isSmall: Bool, isCompact: Bool) -> some View {
        let small = isSmall
        let source = entry.dataSource
        let noSource = source == nil && entry.previewSourceName == nil
        let sourceName = entry.previewSourceName ?? (source == nil ? "Source not set" : source!.id)
        let subtitle = source == nil && entry.previewSourceName == nil ? "Hold widget to select source" : entry.subtitle
        let searchPlaceholder = "Search \(toTitleCase(text: sourceName))..."
        let searchPath = source != nil ? "crotchet://search/\(sourceName)" : "crotchet://";
        let searchUrl = URL(string: searchPath)!

        // Construct URL: if _id exists use source-entry URL, otherwise fallback to search
        let contentUrl: URL = {
            if let id = entry._id, let src = source {
                return URL(string: "crotchet://source-entry/\(src.id)/\(id)")!
            } else {
                return searchUrl
            }
        }()
        let hasData = !sourceName.isEmpty
        
        if(!hasData) {
            Text("Not set")
        }
        else if(small) {
            GeometryReader { geometry in
                let width = geometry.size.width

                if(noSource) {
                    VStack(spacing: 12) {
                        Spacer()
                        Image(systemName: "square.dashed")
                            .font(.system(size: 48))
                            .foregroundColor(.secondary)
                            .opacity(0.4)
                        VStack(spacing: 4) {
                            Text("SOURCE NOT SET")
                                .font(.system(size: 9))
                                .bold()
                                .opacity(0.3)
                            Text("Hold widget to\nselect source")
                                .font(.caption2)
                                .opacity(0.5)
                                .multilineTextAlignment(.center)
                        }
                        Spacer()
                    }
                    .frame(maxWidth: .infinity)
                }
                else {
                    ZStack(alignment: .topTrailing) {
                        Link(destination: contentUrl) {
                            HStack {
                                VStack(alignment: .leading) {
                                    ZStack {
                                        NetworkImage(url: entry.image)
                                            .cornerRadius(8)

                                        if(entry.video != nil) {
                                            Rectangle()
                                                .fill(.black.opacity(0.3))

                                            Image(systemName: "play.circle.fill")
                                                .font(.system(size: 30))
                                                .foregroundColor(.white)
                                        }
                                    }
                                    .aspectRatio(1, contentMode: .fit)
                                    .cornerRadius(8)

                                    Text(toTitleCase(text: sourceName).uppercased())
                                        .font(.system(size: 12))
                                        .bold()
                                        .opacity(0.5)
                                        .padding(.top, 2)
                                        .padding(.bottom, -1)

                                    if(entry.title != nil){
                                        Text(entry.title!)
                                            .lineLimit(1)
                                            .font(.caption2)
                                            .bold()
                                    }

                                    if(subtitle != nil) {
                                        Text(subtitle!)
                                            .lineLimit(1)
                                            .font(.caption2)
                                            .padding(.top, -4)
                                            .opacity(0.7)
                                    }
                                    else {
                                        Spacer()
                                    }
                                }
                                Spacer()
                            }
                        }

                        if(source != nil || entry.previewSourceName != nil){
                            HStack(spacing: -4) {
                                // Show refresh button for Random view
                                if entry.view?.id == "Random", let src = source {
                                    Button(intent: RefreshRandomIntent(source: src.id, widgetSize: "small")) {
                                        Image(systemName: "arrow.triangle.2.circlepath")
                                            .resizable()
                                            .scaledToFit()
                                            .frame(height: 12)
                                    }
                                    .tint(.secondary)
                                    .clipShape(Circle())
                                }

                                Link(destination: searchUrl) {
                                    Button {

                                    } label: {
                                        Image(systemName: "magnifyingglass")
                                            .resizable()
                                            .scaledToFit()
                                            .frame(height: 12)
                                    }
                                    .tint(.secondary)
                                    .clipShape(Circle())
                                }
                            }
                            .padding(.trailing, -10)
                        }
                    }
                }
            }
        }
        else {
            VStack(alignment: .leading, spacing: 0) {
                HStack {
                    Text(noSource ? "SOURCE NOT SET" : toTitleCase(text: sourceName).uppercased())
                        .font(.caption2)
                        .bold()
                        .opacity(noSource ? 0.3 : 0.5)
                    Spacer()

                    if(source != nil || entry.previewSourceName != nil){
                        HStack(spacing: 0) {
                            // Show refresh button for Random view
                            if entry.view?.id == "Random", let src = source {
                                Button(intent: RefreshRandomIntent(source: src.id, widgetSize: "medium")) {
                                    Image(systemName: "arrow.triangle.2.circlepath")
                                        .resizable()
                                        .scaledToFit()
                                        .frame(height: 12)
                                }
                                .tint(.secondary)
                                .clipShape(Circle())
                            }

                            Link(destination: searchUrl) {
                                Button {

                                } label: {
                                    Image(systemName: "magnifyingglass")
                                        .resizable()
                                        .scaledToFit()
                                        .frame(height: 12)
                                }
                                .tint(.secondary)
                                .clipShape(Circle())
                            }
                        }
                    }
                }
                .padding(.top, -8)
                .padding(.trailing, -10)

                if(noSource) {
                    VStack(spacing: 8) {
                        Spacer()
                        Image(systemName: "square.dashed")
                            .font(.system(size: 32))
                            .foregroundColor(.secondary)
                            .opacity(0.4)
                        Text("Hold widget to select source")
                            .font(.caption)
                            .opacity(0.5)
                            .multilineTextAlignment(.center)
                        Spacer()
                    }
                    .frame(maxWidth: .infinity)
                }
                else {
                    let items = entry.items ?? []

                    HStack(spacing: 8) {
                        VStack(spacing: 0) {
                            ForEach(0..<3, id: \.self) { index in
                                let item = items.count > index ? items[index] : nil
                                let itemUrl: URL = {
                                    if let id = item?._id, let src = source {
                                        return URL(string: "crotchet://source-entry/\(src.id)/\(id)")!
                                    } else {
                                        return searchUrl
                                    }
                                }()
                                Link(destination: itemUrl) {
                                    HStack(spacing: 6) {
                                        ZStack {
                                            NetworkImage(url: item?.image ?? entry.image)

                                            if((item?.video ?? entry.video) != nil) {
                                                Rectangle()
                                                    .fill(.black.opacity(0.3))

                                                Image(systemName: "play.fill")
                                                    .font(.system(size: 14))
                                                    .foregroundColor(.white)
                                            }
                                        }
                                        .frame(width: 42, height: 36)
                                        .cornerRadius(4)

                                        VStack(alignment: .leading, spacing: 0) {
                                            if((item?.title ?? entry.title) != nil) {
                                                Text(item?.title ?? entry.title!)
                                                    .lineLimit(1)
                                                    .font(.caption)
                                                    .frame(maxWidth: .infinity, alignment: .leading)
                                            }

                                            if((item?.subtitle ?? subtitle) != nil) {
                                                Text(item?.subtitle ?? subtitle!)
                                                    .lineLimit(1)
                                                    .font(.caption2)
                                                    .opacity(0.5)
                                                    .frame(maxWidth: .infinity, alignment: .leading)
                                            }
                                        }
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                    }
                                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                                }
                                .frame(maxHeight: .infinity)
                            }
                        }
                        .frame(maxWidth: .infinity, maxHeight: .infinity)

                        VStack(spacing: 0) {
                            ForEach(3..<6, id: \.self) { index in
                                let item = items.count > index ? items[index] : nil
                                let itemUrl: URL = {
                                    if let id = item?._id, let src = source {
                                        return URL(string: "crotchet://source-entry/\(src.id)/\(id)")!
                                    } else {
                                        return searchUrl
                                    }
                                }()
                                Link(destination: itemUrl) {
                                    HStack(spacing: 6) {
                                        ZStack {
                                            NetworkImage(url: item?.image ?? entry.image)

                                            if((item?.video ?? entry.video) != nil) {
                                                Rectangle()
                                                    .fill(.black.opacity(0.3))

                                                Image(systemName: "play.fill")
                                                    .font(.system(size: 14))
                                                    .foregroundColor(.white)
                                            }
                                        }
                                        .frame(width: 42, height: 36)
                                        .cornerRadius(4)

                                        VStack(alignment: .leading, spacing: 0) {
                                            if((item?.title ?? entry.title) != nil) {
                                                Text(item?.title ?? entry.title!)
                                                    .lineLimit(1)
                                                    .font(.caption)
                                                    .frame(maxWidth: .infinity, alignment: .leading)
                                            }

                                            if((item?.subtitle ?? subtitle) != nil) {
                                                Text(item?.subtitle ?? subtitle!)
                                                    .lineLimit(1)
                                                    .font(.caption2)
                                                    .opacity(0.5)
                                                    .frame(maxWidth: .infinity, alignment: .leading)
                                            }
                                        }
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                    }
                                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                                }
                                .frame(maxHeight: .infinity)
                            }
                        }
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                    }
                    .padding(.top, 4)
                    .padding(.bottom, -2)
                    .frame(maxHeight: .infinity)
                }
            }
        }
    }
}

// MARK: - Actions Widget View

struct ActionsWidgetView: View {
    var entry: ActionsEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        if family == .systemSmall {
            actionsSmallView()
        } else {
            actionsMediumView()
        }
    }

    @ViewBuilder
    func actionsSmallView() -> some View {
        GeometryReader { geometry in
            VStack(spacing: 8) {
                // Search action - full width, takes remaining height
                let buttonSize = (geometry.size.width - 8) / 2

                actionButton(
                    title: "Search",
                    icon: "number",
                    action: "Search",
                    isSearch: true,
                    isSmallWidget: true,
                    width: geometry.size.width,
                    height: geometry.size.height - buttonSize - 8
                )

                // Bottom row - 2 actions
                HStack(spacing: 8) {
                    actionButton(
                        title: "Clipboard",
                        icon: "square.filled.on.square",
                        action: "Clipboard",
                        isSearch: false,
                        isSmallWidget: true,
                        width: buttonSize,
                        height: buttonSize
                    )

                    actionButton(
                        title: "Pinboard",
                        icon: "pin.fill",
                        action: "Pinboard",
                        isSearch: false,
                        isSmallWidget: true,
                        width: buttonSize,
                        height: buttonSize
                    )

//                    actionButton(
//                        title: "Now Playing",
//                        icon: "music.quarternote.3",
//                        action: "Now playing",
//                        isSearch: false,
//                        isSmallWidget: true,
//                        width: buttonSize,
//                        height: buttonSize
//                    )
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
        }
    }

    @ViewBuilder
    func actionsMediumView() -> some View {
        GeometryReader { geometry in
            VStack(spacing: 8) {
                // Search action - full width, takes remaining height
                let buttonSize = (geometry.size.width - 32) / 5

                GeometryReader { searchGeometry in
                    actionButton(
                        title: "Search",
                        icon: "number",
                        action: "Search",
                        isSearch: true,
                        isSmallWidget: false,
                        width: searchGeometry.size.width,
                        height: searchGeometry.size.height
                    )
                }
                .frame(maxHeight: .infinity)
                .padding(.top, 4)
                .padding(.bottom, 4)

                // Bottom row - 5 actions
                HStack(spacing: 8) {
                    actionButton(
                        title: "Clipboard",
                        icon: "square.filled.on.square",
                        action: "Clipboard",
                        isSearch: false,
                        isSmallWidget: false,
                        width: buttonSize,
                        height: buttonSize
                    )

                    actionButton(
                        title: "Pinboard",
                        icon: "pin.fill",
                        action: "Pinboard",
                        isSearch: false,
                        isSmallWidget: false,
                        width: buttonSize,
                        height: buttonSize
                    )

                    actionButton(
                        title: "Now Playing",
                        icon: "music.quarternote.3",
                        action: "Now playing",
                        isSearch: false,
                        isSmallWidget: false,
                        width: buttonSize,
                        height: buttonSize
                    )

                    actionButton(
                        title: "Random Pic",
                        icon: "photo.on.rectangle.angled",
                        action: "Random Pic",
                        isSearch: false,
                        isSmallWidget: false,
                        width: buttonSize,
                        height: buttonSize
                    )

                    actionButton(
                        title: "Random Prompt",
                        icon: "sparkles",
                        action: "Random Prompt",
                        isSearch: false,
                        isSmallWidget: false,
                        width: buttonSize,
                        height: buttonSize
                    )

//                    actionButton(
//                        title: "Text to QR",
//                        icon: "qrcode",
//                        action: "Text to Qr",
//                        isSearch: false,
//                        isSmallWidget: false,
//                        width: buttonSize,
//                        height: buttonSize
//                    )
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
        }
    }

    struct SearchButtonView: View {
        let title: String
        let icon: String
        let isMedium: Bool
        let width: CGFloat
        let height: CGFloat
        @Environment(\.colorScheme) var colorScheme

        var body: some View {
            ZStack(alignment: .leading) {
                Color(.systemGray5)

                HStack(spacing: 8) {
                    // Icon with different styles for light/dark mode
                    ZStack {
                        if colorScheme == .dark {
                            // Dark mode: gradient background with number icon
                            LinearGradient(
                                gradient: Gradient(colors: [
                                    Color(red: 211/255, green: 255/255, blue: 255/255),
                                    Color(red: 242/255, green: 221/255, blue: 176/255)
                                ]),
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )

                            Image(systemName: icon)
                                .font(.system(size: 16))
                                .foregroundColor(Color(red: 62/255, green: 50/255, blue: 21/255))
                        } else {
                            // Light mode: subtle background with magnifying glass
                            Circle()
                                .fill(Color.primary.opacity(0.05))

                            Image(systemName: "magnifyingglass")
                                .font(.system(size: 16))
                                .foregroundColor(.primary)
                        }
                    }
                    .frame(width: 32, height: 32)
                    .clipShape(Circle())

                    Text(title)
                        .font(isMedium ? .body : .callout)
                        .fontWeight(.medium)
                        .foregroundColor(.primary.opacity(0.6))
                }
                .padding(.horizontal, 12)
            }
            .frame(width: width, height: height)
            .clipShape(RoundedRectangle(cornerRadius: height / 2))
        }
    }

    func actionButton(title: String, icon: String, action: String, isSearch: Bool, isSmallWidget: Bool, width: CGFloat, height: CGFloat) -> some View {
        let url = URL(string: "crotchet://search/pinnedItems")!
        let isMedium = width > 200 // Detect medium widget based on width

        return Link(destination: url) {
            if isSearch {
                SearchButtonView(title: title, icon: icon, isMedium: isMedium, width: width, height: height)
            } else {
                // Other actions: circle with gray background
                ZStack {
                    Color(.systemGray5)

                    Image(systemName: icon)
                        .font(.system(size: 20))
                        .foregroundColor(.primary.opacity(0.6))
                }
                .frame(width: width, height: height)
                .clipShape(Circle())
            }
        }
    }
}

// MARK: - Widget Definitions

@available(iOS 17.0, *)
struct CrotchetWidgetDefaultSmall: Widget {
    let kind: String = "CrotchetWidgetDefaultSmall"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: ConfigurationAppIntent.self, provider: Provider()) { entry in
            CrotchetWidgetEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Crotchet - Default")
        .description("Standard layout for your content")
        .supportedFamilies([.systemSmall])
    }
}

@available(iOS 17.0, *)
struct CrotchetWidgetDefaultMedium: Widget {
    let kind: String = "CrotchetWidgetDefaultMedium"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: ConfigurationAppIntent.self, provider: Provider()) { entry in
            CrotchetWidgetEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Crotchet - Default")
        .description("Standard layout for your content")
        .supportedFamilies([.systemMedium])
    }
}

@available(iOS 17.0, *)
struct CrotchetWidgetHighlight: Widget {
    let kind: String = "CrotchetWidgetHighlight"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: ConfigurationHighlightAppIntent.self, provider: ProviderHighlight()) { entry in
            CrotchetWidgetEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Crotchet - Highlight")
        .description("Edge-to-edge (small) or featured layout (medium)")
        .supportedFamilies([.systemSmall, .systemMedium])
        .contentMarginsDisabled()
    }
}

@available(iOS 17.0, *)
struct CrotchetWidgetPerson: Widget {
    let kind: String = "CrotchetWidgetPerson"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: ConfigurationPersonAppIntent.self, provider: ProviderPersonSmall()) { entry in
            CrotchetWidgetEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Crotchet - Person")
        .description("Single person (small), 4 people (medium), or 3x2 grid (large)")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

@available(iOS 17.0, *)
struct CrotchetWidgetActions: Widget {
    let kind: String = "CrotchetWidgetActions"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: ConfigurationActionsAppIntent.self, provider: ProviderActions()) { entry in
            ActionsWidgetView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Crotchet - Actions")
        .description("Quick access to common actions")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}


#Preview(as: .systemSmall) {
    CrotchetWidgetDefaultSmall()
} timeline: {
    SimpleEntry(date: .now, template: .defaultTemplate)
}

#Preview(as: .systemMedium) {
    CrotchetWidgetDefaultMedium()
} timeline: {
    SimpleEntry(date: .now, template: .defaultTemplate)
}

#Preview(as: .systemSmall) {
    CrotchetWidgetHighlight()
} timeline: {
    SimpleEntry(date: .now, template: .highlight)
}

#Preview(as: .systemMedium) {
    CrotchetWidgetHighlight()
} timeline: {
    SimpleEntry(date: .now, template: .highlight)
}

#Preview(as: .systemSmall) {
    CrotchetWidgetPerson()
} timeline: {
    SimpleEntry(date: .now, template: .person)
}

#Preview(as: .systemMedium) {
    CrotchetWidgetPerson()
} timeline: {
    SimpleEntry(date: .now, template: .person)
}

#Preview(as: .systemLarge) {
    CrotchetWidgetPerson()
} timeline: {
    SimpleEntry(date: .now, template: .person)
}
