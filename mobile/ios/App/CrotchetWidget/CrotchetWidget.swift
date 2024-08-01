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
        SimpleEntry(date: Date(),
                    configuration: ConfigurationAppIntent())
    }
    
    func snapshot(for configuration: ConfigurationAppIntent, in context: Context) async -> SimpleEntry {
        SimpleEntry(date: Date(), configuration: configuration)
    }
    
    func timeline(for configuration: ConfigurationAppIntent, in context: Context) async -> Timeline<SimpleEntry> {
        var entries: [SimpleEntry] = []
        
        let sharedDefaults = UserDefaults.init(suiteName: "group.tz.co.crotchet")
        
        var image: String? = nil
        var video: String? = nil
        var title: String? = nil
        var subtitle: String? = nil
        var url: String? = nil
        
        if(sharedDefaults != nil) {
            if(configuration.dataSource != nil) {
                let sourceObject: String? = sharedDefaults?.string(forKey: configuration.dataSource!.id + configuration.view.id )
                
                if(sourceObject != nil) {
                    let jsonString = sourceObject!
                    let data = Data(jsonString.utf8)
                    do {
                        if let dictionary = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] {
                            video = dictionary["video"] as? String
                            image = dictionary["image"] as? String
                            title = dictionary["title"] as? String
                            subtitle = dictionary["subtitle"] as? String
                            url = dictionary["url"] as? String
                        }
                    } catch let error as NSError {
                        print("Failed to load: \(error.localizedDescription)")
                    }
                }
            }
        }
        
        let currentDate = Date()
        let entryDate = Calendar.current.date(byAdding: .minute, value: 5, to: currentDate)!
        let entry = SimpleEntry(date: entryDate,
                                video: video,
                                image: image, title: title, subtitle: subtitle,
                                url: url,
                                configuration: configuration)
        entries.append(entry)
        
        return Timeline(entries: entries, policy: .atEnd)
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let image: String?
    let video: String?
    let title: String?
    let subtitle: String?
    let url: String?
    let configuration: ConfigurationAppIntent
    
    init(date: Date, video: String? = nil, image: String? = nil, title: String? = nil, subtitle: String? = nil, url: String? = nil, configuration: ConfigurationAppIntent) {
        self.date = date
        self.image = image ?? video
        self.video = video
        self.title = title
        self.subtitle = subtitle
        self.url = url
        self.configuration = configuration
    }
}

struct NetworkImage: View {
    var url: String?
    
    var body: some View {
        Group {
            let image = URL(string: url ?? "some")!
            if let imageData = try? Data(contentsOf: image),
               let uiImage = UIImage(data: imageData) {
                
                Image(uiImage: uiImage)
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            }
            else {
                Rectangle()
                    .fill(.foreground.opacity(0.1))
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
        let noSource = source == nil;
        let sourceName = source == nil ? "Source not set" : source!.id
        let subtitle = source == nil ? "Hold widget to select source" : entry.subtitle
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
                
                ZStack(alignment: .topTrailing) {
                    Link(destination: contentUrl) {
                        HStack {
                            VStack(alignment: .leading) {
                                ZStack {
                                    NetworkImage(url: entry.image)
                                        .aspectRatio(1, contentMode: .fit)
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
                                .cornerRadius(8)
                                .padding(.trailing, 18)
                                
                                Text(toTitleCase(text: sourceName).uppercased())
                                    .font(.system(size: 12))
                                    .bold()
                                    .opacity(noSource ? 0.3 : 0.5)
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
                                        .lineLimit(noSource ? 2 : 1)
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
                    
                    if(source != nil){
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
                                .clipShape(/*@START_MENU_TOKEN@*/Circle()/*@END_MENU_TOKEN@*/)
                            }
                        }
                        .padding(.trailing, 8)
                    }
                    
                }
                .padding(.vertical, 14)
            }
        }
        else {
            GeometryReader { geometry in
                let width = geometry.size.width
                let height = geometry.size.height
                
                VStack(spacing: 0) {
                    VStack {
                        HStack {
                            Text(toTitleCase(text: sourceName).uppercased())
                                .font(.caption2)
                                .bold()
                                .opacity(noSource ? 0.3 : 0.5)
                            Spacer()
                            
                        }
                        .padding(.top, 16)
                        .padding(.leading, 20)
                        .padding(.trailing, 24)
                        
                        Link(destination: searchUrl) {
                            ZStack {
                                Rectangle()
                                    .fill(.foreground.opacity(0.055))
                                    .cornerRadius(50)
                                HStack {
                                    Image(systemName: "magnifyingglass")
                                        .resizable()
                                        .scaledToFit()
                                        .frame(height: 14)
                                        .padding(.leading, 14)
                                    
                                    Text(noSource ? "Search..." : searchPlaceholder)
                                        .font(.footnote)
                                        .padding(.leading, 2)
                                    Spacer()
                                }
                                .opacity(noSource ? 0.25 : 0.45)
                            }
                            .padding(.horizontal, 12)
                            .padding(.bottom, 12)
                        }
                    }
                    .frame(width: width, height: height*0.55)
                    .background(.foreground.opacity(0.06))
                    
                    if(noSource) {
                        VStack {
                            Spacer()
                            Text(subtitle ?? "")
                                .font(.caption)
                                .opacity(0.7)
                            Spacer()
                        }
                    }
                    else {
                        Link(destination: contentUrl) {
                            HStack {
                                ZStack {
                                    NetworkImage(url: entry.image)
                                        .aspectRatio(1, contentMode: .fit)
                                        .cornerRadius(8)
                                    
                                    if(entry.video != nil) {
                                        Rectangle()
                                            .fill(.black.opacity(0.3))
                                        
                                        Image(systemName: "play.circle.fill")
                                            .font(.system(size: 24))
                                            .foregroundColor(.white)
                                    }
                                }
                                .frame(maxWidth: 70)
                                .cornerRadius(8)
                                
                                VStack(alignment: .leading) {
                                    if(entry.title != nil) {
                                        Text(entry.title!)
                                            .lineLimit(1)
                                            .font(.caption)
                                            .bold()
                                    }
                                    
                                    if(subtitle != nil) {
                                        Text(subtitle!)
                                            .lineLimit(1)
                                            .font(.caption2)
                                            .padding(.top, -4)
                                            .opacity(0.7)
                                    }
                                }
                                
                                Spacer()
                            }
                            .padding(.horizontal, 14)
                            .padding(.vertical, 12)
                        }
                    }
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
