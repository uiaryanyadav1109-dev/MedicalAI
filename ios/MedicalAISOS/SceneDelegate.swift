import UIKit

/**
 * SceneDelegate: Manages iOS Deep Linking & Lock-Screen URL Scheme routing
 * When receiving medicalai://sos:
 * 1. Bypasses biometric authentication / passcode gates.
 * 2. Launches the SOS action handler immediately.
 */
class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?

    func scene(
        _ scene: UIScene,
        willConnectTo session: UISceneSession,
        options connectionOptions: UIScene.ConnectionOptions
    ) {
        guard let windowScene = (scene as? UIWindowScene) else { return }

        // Check if opened via URL context on initial launch
        if let urlContext = connectionOptions.urlContexts.first {
            handleDeepLink(url: urlContext.url)
        }
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        guard let url = URLContexts.first?.url else { return }
        handleDeepLink(url: url)
    }

    private func handleDeepLink(url: URL) {
        guard url.scheme == "medicalai" else { return }

        if url.host == "sos" || url.path.contains("sos") {
            // CRITICAL SAFETY REQUIREMENT:
            // Bypass Passcode / FaceID authentication gatekeepers
            triggerEmergencySOSWorkflow()
        }
    }

    private func triggerEmergencySOSWorkflow() {
        guard let rootVC = window?.rootViewController else { return }

        // Post a notification or dispatch directly to the root WebView bridge
        NotificationCenter.default.post(
            name: NSNotification.Name("TriggerEmergencySOS"),
            object: nil
        )

        // If embedded in a web view or navigation controller, load the direct SOS URL
        if let topController = getTopViewController(from: rootVC) {
            topController.view.backgroundColor = .black
        }
    }

    private func getTopViewController(from root: UIViewController) -> UIViewController? {
        if let nav = root as? UINavigationController {
            return nav.visibleViewController
        }
        if let tab = root as? UITabBarController {
            return tab.selectedViewController
        }
        if let presented = root.presentedViewController {
            return getTopViewController(from: presented)
        }
        return root
    }
}
