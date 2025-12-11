import Foundation
import Capacitor
import FirebaseMessaging

@objc(FirebaseMessagingPlugin)
public class FirebaseMessagingPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "FirebaseMessagingPlugin"
    public let jsName = "FirebaseMessagingPlugin"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "subscribeToTopic", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "unsubscribeFromTopic", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getToken", returnType: CAPPluginReturnPromise)
    ]

    @objc func subscribeToTopic(_ call: CAPPluginCall) {
        guard let topic = call.getString("topic") else {
            call.reject("Topic is required")
            return
        }

        Messaging.messaging().subscribe(toTopic: topic) { error in
            if let error = error {
                call.reject("Failed to subscribe to topic: \(error.localizedDescription)")
            } else {
                call.resolve(["success": true, "topic": topic])
            }
        }
    }

    @objc func unsubscribeFromTopic(_ call: CAPPluginCall) {
        guard let topic = call.getString("topic") else {
            call.reject("Topic is required")
            return
        }

        Messaging.messaging().unsubscribe(fromTopic: topic) { error in
            if let error = error {
                call.reject("Failed to unsubscribe from topic: \(error.localizedDescription)")
            } else {
                call.resolve(["success": true, "topic": topic])
            }
        }
    }

    @objc func getToken(_ call: CAPPluginCall) {
        Messaging.messaging().token { token, error in
            if let error = error {
                call.reject("Failed to get FCM token: \(error.localizedDescription)")
            } else if let token = token {
                call.resolve(["token": token])
            } else {
                call.reject("No FCM token available")
            }
        }
    }
}
