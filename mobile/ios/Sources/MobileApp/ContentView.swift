import SwiftUI
import SwiftData

struct ContentView: View {
    @Environment(\.modelContext) private var modelContext

    @StateObject private var auth = AuthViewModel()

    var body: some View {
        NavigationView {
            VStack(spacing: 16) {
                if auth.isAuthenticated {
                    Button("Sync clients") {
                        Task {
                            do { try await SyncManager.shared.syncClients(modelContext: modelContext, token: auth.token) }
                            catch { print("Sync clients failed:", error) }
                        }
                    }
                    Button("Sync properties") {
                        Task {
                            do { try await SyncManager.shared.syncProperties(modelContext: modelContext, token: auth.token) }
                            catch { print("Sync properties failed:", error) }
                        }
                    }
                    List {
                        Text("Open Clients or Properties views")
                    }
                } else {
                    LoginView()
                        .environmentObject(auth)
                }
            }
            .padding()
            .navigationTitle("RealEstate CRM")
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View { ContentView() }
}
