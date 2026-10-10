import WidgetKit
import SwiftUI

/**
 * MedicalAISOSWidget: WidgetKit Lock Screen Extension
 * Renders a "One-Tap SOS" emergency button on the iOS Lock Screen.
 * Tapping the widget opens the app directly into the SOS action handler via the custom URL scheme:
 * medicalai://sos
 */
struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SOSEntry {
        SOSEntry(date: Date())
    }

    func getSnapshot(in context: Context, completion: @escaping (SOSEntry) -> ()) {
        let entry = SOSEntry(date: Date())
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        let entry = SOSEntry(date: Date())
        let timeline = Timeline(entries: [entry], policy: .never)
        completion(timeline)
    }
}

struct SOSEntry: TimelineEntry {
    let date: Date
}

struct MedicalAISOSWidgetEntryView : View {
    @Environment(\.widgetFamily) var family
    var entry: Provider.Entry

    var body: some View {
        switch family {
        case .accessoryCircular:
            // Circular lock screen widget (iOS 16+)
            ZStack {
                AccessoryWidgetBackground()
                VStack(spacing: 1) {
                    Image(systemName: "cross.case.fill")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.white)
                    Text("SOS")
                        .font(.system(size: 11, weight: .black, design: .rounded))
                        .foregroundColor(.white)
                }
            }
            .widgetURL(URL(string: "medicalai://sos")!)

        case .accessoryRectangular:
            // Rectangular lock screen widget
            HStack(spacing: 8) {
                Image(systemName: "waveform.path.ecg")
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(.white)
                VStack(alignment: .leading, spacing: 2) {
                    Text("EMERGENCY SOS")
                        .font(.system(size: 12, weight: .heavy, design: .rounded))
                    Text("Tap to trigger beacon")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(.secondary)
                }
            }
            .widgetURL(URL(string: "medicalai://sos")!)

        default:
            // Standard small home screen widget
            VStack(spacing: 8) {
                ZStack {
                    Circle()
                        .fill(Color.red)
                        .frame(width: 54, height: 54)
                    Image(systemName: "sos")
                        .font(.system(size: 24, weight: .black, design: .rounded))
                        .foregroundColor(.white)
                }
                Text("Emergency SOS")
                    .font(.caption)
                    .fontWeight(.bold)
            }
            .widgetURL(URL(string: "medicalai://sos")!)
        }
    }
}

@main
struct MedicalAISOSWidget: Widget {
    let kind: String = "MedicalAISOSWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            MedicalAISOSWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Emergency SOS")
        .description("One-Tap distress trigger directly from your lock screen.")
        .supportedFamilies([
            .accessoryCircular,
            .accessoryRectangular,
            .systemSmall
        ])
    }
}
