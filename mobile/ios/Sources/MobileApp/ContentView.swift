import SwiftUI
import SwiftData

struct ContentView: View {
    @Environment(
        \._modelContext
    ) private var modelContext

    @StateObject private var auth = AuthViewModel()

    var body: some View {
        NavigationView {
            VStack(spacing: 16) {
                if auth.isAuthenticated {
                    Button("Sync clients") {
                        Task {
                            try? await SyncManager.shared.syncClients(modelContext: modelContext, token: auth.token)
                        }
                    }
                    Button("Sync properties") {
                        Task {
                            try? await SyncManager.shared.syncProperties(modelContext: modelContext, token: auth.token)
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
