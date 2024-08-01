//
//  CrotchetWidgetLiveActivity.swift
//  CrotchetWidget
//
//  Created by Walter Kimaro on 09/05/2024.
//

import ActivityKit
import WidgetKit
import SwiftUI

struct CrotchetWidgetAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        // Dynamic stateful properties about your activity go here!
        var emoji: String
    }

    // Fixed non-changing properties about your activity go here!
    var name: String
}

struct CrotchetWidgetLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: CrotchetWidgetAttributes.self) { context in
            // Lock screen/banner UI goes here
            VStack {
                Text("Hello \(context.state.emoji)")
            }
            .activityBackgroundTint(Color.cyan)
            .activitySystemActionForegroundColor(Color.black)

        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded UI goes here.  Compose the expanded UI through
                // various regions, like leading/trailing/center/bottom
                DynamicIslandExpandedRegion(.leading) {
                    Text("Leading")
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("Trailing")
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text("Bottom \(context.state.emoji)")
                    // more content
                }
            } compactLeading: {
                Text("L")
            } compactTrailing: {
                Text("T \(context.state.emoji)")
            } minimal: {
                Text(context.state.emoji)
            }
            .widgetURL(URL(string: "http://www.apple.com"))
            .keylineTint(Color.red)
        }
    }
}

extension CrotchetWidgetAttributes {
    fileprivate static var preview: CrotchetWidgetAttributes {
        CrotchetWidgetAttributes(name: "World")
    }
}

extension CrotchetWidgetAttributes.ContentState {
    fileprivate static var smiley: CrotchetWidgetAttributes.ContentState {
        CrotchetWidgetAttributes.ContentState(emoji: "😀")
     }
     
     fileprivate static var starEyes: CrotchetWidgetAttributes.ContentState {
         CrotchetWidgetAttributes.ContentState(emoji: "🤩")
     }
}

#Preview("Notification", as: .content, using: CrotchetWidgetAttributes.preview) {
   CrotchetWidgetLiveActivity()
} contentStates: {
    CrotchetWidgetAttributes.ContentState.smiley
    CrotchetWidgetAttributes.ContentState.starEyes
}
