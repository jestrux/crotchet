//
//  CrotchetWidget.swift
//  CrotchetWidget
//
//  Created by Walter Kimaro on 09/05/2024.
//

import WidgetKit
import SwiftUI

struct Provider: AppIntentTimelineProvider {
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
                    url: nil
                )
            }
            return SimpleEntry(date: Date(),
                             items: placeholderItems,
                             configuration: ConfigurationAppIntent())
        } else {
            return SimpleEntry(date: Date(),
                             image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
                             title: "The Art of Modern Design",
                             subtitle: "A deep dive into aesthetics",
                             configuration: ConfigurationAppIntent())
        }
    }

    func snapshot(for configuration: ConfigurationAppIntent, in context: Context) async -> SimpleEntry {
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
                    url: nil
                )
            }
            return SimpleEntry(date: Date(),
                             items: placeholderItems,
                             configuration: configuration,
                             previewSourceName: "My Content")
        } else {
            return SimpleEntry(date: Date(),
                             image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
                             title: "The Art of Modern Design",
                             subtitle: "A deep dive into aesthetics",
                             configuration: configuration,
                             previewSourceName: "My Content")
        }
    }
    
    func timeline(for configuration: ConfigurationAppIntent, in context: Context) async -> Timeline<SimpleEntry> {
        var entries: [SimpleEntry] = []

        let sharedDefaults = UserDefaults.init(suiteName: "group.tz.co.crotchet")

        var image: String? = nil
        var video: String? = nil
        var title: String? = nil
        var subtitle: String? = nil
        var url: String? = nil
        var items: [ItemData]? = nil

        // Determine if we should fetch list data based on widget family
        let isMediumWidget = context.family == .systemMedium
        let viewId = isMediumWidget ? configuration.view.id + "List" : configuration.view.id

        if(sharedDefaults != nil) {
            if(configuration.dataSource != nil) {
                let sourceObject: String? = sharedDefaults?.string(forKey: configuration.dataSource!.id + viewId)

                if(sourceObject != nil) {
                    let jsonString = sourceObject!
                    let data = Data(jsonString.utf8)
                    do {
                        // Check if it's a list view (medium widget)
                        if isMediumWidget {
                            // Parse as array
                            if let array = try JSONSerialization.jsonObject(with: data, options: []) as? [[String: Any]] {
                                items = array.map { dict in
                                    ItemData(
                                        image: dict["image"] as? String ?? dict["video"] as? String,
                                        video: dict["video"] as? String,
                                        title: dict["title"] as? String,
                                        subtitle: dict["subtitle"] as? String,
                                        url: dict["url"] as? String
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
                                items: items,
                                configuration: configuration)
        entries.append(entry)

        return Timeline(entries: entries, policy: .atEnd)
    }
}

struct ItemData {
    let image: String?
    let video: String?
    let title: String?
    let subtitle: String?
    let url: String?
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let image: String?
    let video: String?
    let title: String?
    let subtitle: String?
    let url: String?
    let items: [ItemData]?
    let configuration: ConfigurationAppIntent
    let previewSourceName: String?

    init(date: Date, video: String? = nil, image: String? = nil, title: String? = nil, subtitle: String? = nil, url: String? = nil, items: [ItemData]? = nil, configuration: ConfigurationAppIntent, previewSourceName: String? = nil) {
        self.date = date
        self.image = image ?? video
        self.video = video
        self.title = title
        self.subtitle = subtitle
        self.url = url
        self.items = items
        self.configuration = configuration
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
    var entry: Provider.Entry
    
    @Environment(\.widgetFamily) var family
    
    @ViewBuilder
    func image(url: String?) -> some View {
        let size = family == .systemMedium ? 90.0 : 60.0;
        
        if url != nil || entry.image != nil {
            let image = URL(string: url ?? entry.image!)!;
            let source = entry.configuration.dataSource;
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
    
    @ViewBuilder
    func content() -> some View {
        let small = family == .systemSmall
        let source = entry.configuration.dataSource
        let noSource = source == nil && entry.previewSourceName == nil
        let sourceName = entry.previewSourceName ?? (source == nil ? "Source not set" : source!.id)
        let subtitle = source == nil && entry.previewSourceName == nil ? "Hold widget to select source" : entry.subtitle
        let searchPlaceholder = "Search \(toTitleCase(text: sourceName))..."
        let searchPath = source != nil ? "crotchet://search/\(sourceName)" : "crotchet://";
        let searchUrl = URL(string: searchPath)!
        let contentUrl = URL(string: entry.url ?? searchPath)!
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
                                    .frame(maxWidth: width - 80)
                                    .aspectRatio(1, contentMode: .fit)
                                    .cornerRadius(8)
                                    .padding(.trailing, 18)

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
                            .padding(.horizontal, 14)
                        }

                        if(source != nil || entry.previewSourceName != nil){
                            Group {
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
                            .padding(.trailing, 8)
                        }
                    }
                    .padding(.vertical, 14)
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
                .padding(.leading, 14)
                .padding(.trailing, 8)
                .padding(.top, 6)

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
                                Link(destination: contentUrl) {
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
                                Link(destination: contentUrl) {
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
                    .padding(.horizontal, 12)
                    .padding(.top, 2)
                    .padding(.bottom, 6)
                    .frame(maxHeight: .infinity)
                }
            }
        }
    }
    
    var body: some View {
        content()
    }
}

struct CrotchetWidget: Widget {
    let kind: String = "CrotchetWidget"
    
    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: ConfigurationAppIntent.self, provider: Provider()) { entry in
            CrotchetWidgetEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .contentMarginsDisabled()
        .supportedFamilies([
            .systemSmall,
            .systemMedium
        ])
    }
}


#Preview(as: .systemSmall) {
    CrotchetWidget()
} timeline: {
    SimpleEntry(date: .now, configuration: ConfigurationAppIntent())
}

#Preview(as: .systemMedium) {
    CrotchetWidget()
} timeline: {
    SimpleEntry(date: .now, configuration: ConfigurationAppIntent())
}
