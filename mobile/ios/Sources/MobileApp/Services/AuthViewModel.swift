import Foundation
import SwiftUI

@MainActor
class AuthViewModel: ObservableObject {
    @Published var token: String?
    @Published var isAuthenticated: Bool = false

    private let key = "recrm_jwt"

    init() {
        token = KeychainHelper.standard.read(service: key, account: "user")
        isAuthenticated = token != nil
    }

    func signIn(email: String, password: String) async throws {
        let (token, _) = try await API.signIn(email: email, password: password)
        self.token = token
        KeychainHelper.standard.save(token, service: key, account: "user")
        isAuthenticated = true
    }

    func signOut() {
        token = nil
        KeychainHelper.standard.delete(service: key, account: "user")
        isAuthenticated = false
    }
}
