import SwiftUI
import SwiftData

@main
struct MobileApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(for: [Client.self, Property.self])
    }
}
