import AppIntents
import SwiftUI
import WidgetKit
import AudioToolbox

/**
 * iOS 18 Controls API & App Intents Integration
 * Allows the Emergency SOS action to be placed in the iOS 18 Control Center,
 * Lock Screen Quick Actions (replacing Flashlight/Camera), and iPhone Action Button.
 */

@available(iOS 18.0, *)
struct EmergencySOSControl: ControlWidget {
    static let kind: String = "com.medicalai.emergency.control"

    var body: some ControlWidgetConfiguration {
        StaticControlConfiguration(kind: Self.kind) {
            ControlWidgetButton(action: TriggerEmergencySOSIntent()) {
                Label("Emergency SOS", systemImage: "cross.fill")
            }
        }
        .displayName("Emergency SOS")
        .description("Instantly initiates a 5-second cancelable SOS distress signal.")
    }
}

/**
 * AppIntent triggered when user taps the Control Center button or Lock Screen action
 */
struct TriggerEmergencySOSIntent: AppIntent {
    static var title: LocalizedStringResource = "Trigger Emergency SOS"
    static var description = IntentDescription("Triggers the 5-second countdown distress beacon and opens Medical AI directly.")
    static var openAppWhenRun: Bool = true

    @MainActor
    func perform() async throws -> some IntentResult & OpensIntent {
        // Immediate sensory haptic & audio chirp on hardware trigger
        AudioServicesPlaySystemSound(1053) // System vibration / distress warning sound

        guard let sosURL = URL(string: "medicalai://sos") else {
            return .result()
        }

        return .result(opensIntent: OpenURLIntent(sosURL))
    }
}
