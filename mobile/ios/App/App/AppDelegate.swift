import UIKit
import SendIntent
import Capacitor
import Firebase
import FirebaseMessaging
import WebKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, MessagingDelegate, UNUserNotificationCenterDelegate, WKScriptMessageHandler {

    var window: UIWindow?
    let store = ShareStore.store

    func notifyWebView(eventName: String, data: [String: Any]) {
        guard let bridge = (window?.rootViewController as? CAPBridgeViewController)?.bridge else {
            print("⚠️ Bridge not available")
            return
        }

        // Convert data dictionary to JSON string
        guard let jsonData = try? JSONSerialization.data(withJSONObject: data),
              let jsonString = String(data: jsonData, encoding: .utf8) else {
            return
        }

        // Dispatch CustomEvent with data in detail property
        let jsCode = """
        (function() {
            var event = new CustomEvent('\(eventName)', { detail: \(jsonString) });
            window.dispatchEvent(event);
        })();
        """

        bridge.webView?.evaluateJavaScript(jsCode, completionHandler: nil)
    }

    func setupCustomWindowFunctions() {
        // Wait a bit for bridge to be ready
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { [weak self] in
            guard let self = self,
                  let bridge = (self.window?.rootViewController as? CAPBridgeViewController)?.bridge else {
                return
            }

            // Expose minimizeApp function to JavaScript
            let jsCode = """
            window.minimizeAppIos = function() {
                window.webkit.messageHandlers.minimizeAppIos.postMessage({});
                return Promise.resolve();
            };
            """

            bridge.webView?.evaluateJavaScript(jsCode, completionHandler: nil)

            // Add message handler for minimizeAppIos
            let contentController = bridge.webView?.configuration.userContentController
            contentController?.add(self, name: "minimizeAppIos")
        }
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        if message.name == "minimizeAppIos" {
            DispatchQueue.main.async {
                let selector = NSSelectorFromString("suspend")
                if UIApplication.shared.responds(to: selector) {
                    UIApplication.shared.perform(selector)
                }
            }
        }
    }

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Register custom window functions
        setupCustomWindowFunctions()

        // Initialize Firebase
        FirebaseApp.configure()

        // Set FCM messaging delegate
        Messaging.messaging().delegate = self

        // Set notification delegate
        UNUserNotificationCenter.current().delegate = self

        // Request notification permissions
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
            if granted {
                DispatchQueue.main.async {
                    application.registerForRemoteNotifications()
                }
            }
        }

        return true
    }

    // MARK: - FCM Token
    func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
        print("🔥 Firebase registration token: \(String(describing: fcmToken))")

        // Store the token for later use
        let dataDict: [String: String] = ["token": fcmToken ?? ""]
        NotificationCenter.default.post(
            name: Notification.Name("FCMToken"),
            object: nil,
            userInfo: dataDict
        )
    }

    // MARK: - Push Notifications
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        Messaging.messaging().apnsToken = deviceToken

        // Subscribe to topics after APNs token is set
        subscribeToTopics()
    }

    func subscribeToTopics() {
        Messaging.messaging().subscribe(toTopic: "widget-refresh-random") { error in
            if let error = error {
                print("❌ Error subscribing to topic: \(error)")
            } else {
                print("✅ Subscribed to widget-refresh-random topic")
            }
        }
    }

    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        print("❌ Failed to register for notifications: \(error)")
    }

    // MARK: - Notification Handling

    // Handle notification taps
    func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse, withCompletionHandler completionHandler: @escaping () -> Void) {
        let userInfo = response.notification.request.content.userInfo
        print("🔔 Notification tapped: \(userInfo)")

        // Clear all badges and notifications
        UIApplication.shared.applicationIconBadgeNumber = 0
        UNUserNotificationCenter.current().removeAllDeliveredNotifications()

        // Extract action type and payload
        let type = userInfo["type"] as? String ?? ""

        // Extract all other keys as payload (excluding "type")
        var payload: [String: Any] = [:]
        for (key, value) in userInfo {
            if let keyString = key as? String, keyString != "type" {
                payload[keyString] = value
            }
        }

        // Dispatch generic background action
        if !type.isEmpty {
            notifyWebView(eventName: "BackgroundAction", data: [
                "type": type,
                "payload": payload
            ])
        }

        completionHandler()
    }

    // Handle background push notifications
    func application(_ application: UIApplication, didReceiveRemoteNotification userInfo: [AnyHashable: Any], fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
        // Extract action type and payload
        let type = userInfo["type"] as? String ?? ""

        // Extract all other keys as payload (excluding "type")
        var payload: [String: Any] = [:]
        for (key, value) in userInfo {
            if let keyString = key as? String, keyString != "type" {
                payload[keyString] = value
            }
        }

        // Dispatch generic background action
        if !type.isEmpty {
            notifyWebView(eventName: "BackgroundAction", data: [
                "type": type,
                "payload": payload
            ])
            completionHandler(.newData)
        } else {
            completionHandler(.noData)
        }
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.

        // Clear all badges and notifications when app becomes active
        UIApplication.shared.applicationIconBadgeNumber = 0
        UNUserNotificationCenter.current().removeAllDeliveredNotifications()
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        var success = true
        if CAPBridge.handleOpenUrl(url, options) {
            success = ApplicationDelegateProxy.shared.application(app, open: url, options: options)
        }
        
        guard let components = NSURLComponents(url: url, resolvingAgainstBaseURL: true),
              let params = components.queryItems else {
                  return false
              }
        let titles = params.filter { $0.name == "title" }
        let descriptions = params.filter { $0.name == "description" }
        let types = params.filter { $0.name == "type" }
        let urls = params.filter { $0.name == "url" }
        
        store.shareItems.removeAll()
    
        if(titles.count > 0){
            for index in 0...titles.count-1 {
                var shareItem: JSObject = JSObject()
                shareItem["title"] = titles[index].value!
                shareItem["description"] = descriptions[index].value!
                shareItem["type"] = types[index].value!
                shareItem["url"] = urls[index].value!
                store.shareItems.append(shareItem)
            }
        }
        
        store.processed = false
        let nc = NotificationCenter.default
        nc.post(name: Notification.Name("triggerSendIntent"), object: nil )
        
        return success
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}
