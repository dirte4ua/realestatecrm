import Foundation

enum APIError: Error {
    case invalidURL
    case invalidResponse
}

struct API {
    static var baseURL = URL(string: "https://realestatecrm.stackforgeit.com")!

    static func fetchClients(token: String?) async throws -> [ClientResponse] {
        guard let url = URL(string: "/api/clients", relativeTo: baseURL) else { throw APIError.invalidURL }
        var req = URLRequest(url: url)
        req.httpMethod = "GET"
        if let token = token { req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization") }

        let (data, resp) = try await URLSession.shared.data(for: req)
        guard let http = resp as? HTTPURLResponse, http.statusCode == 200 else { throw APIError.invalidResponse }
        return try JSONDecoder().decode([ClientResponse].self, from: data)
    }

    static func fetchProperties(token: String?) async throws -> [PropertyResponse] {
        guard let url = URL(string: "/api/properties", relativeTo: baseURL) else { throw APIError.invalidURL }
        var req = URLRequest(url: url)
        req.httpMethod = "GET"
        if let token = token { req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization") }

        let (data, resp) = try await URLSession.shared.data(for: req)
        guard let http = resp as? HTTPURLResponse, http.statusCode == 200 else { throw APIError.invalidResponse }
        return try JSONDecoder().decode([PropertyResponse].self, from: data)
    }

    static func signIn(email: String, password: String) async throws -> (token: String, userId: String) {
        guard let url = URL(string: "/api/auth/token", relativeTo: baseURL) else { throw APIError.invalidURL }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body = ["email": email, "password": password]
        req.httpBody = try JSONEncoder().encode(body)

        let (data, resp) = try await URLSession.shared.data(for: req)
        guard let http = resp as? HTTPURLResponse, (200...299).contains(http.statusCode) else {
            throw APIError.invalidResponse
        }
        let parsed = try JSONDecoder().decode(SignInResponse.self, from: data)
        return (token: parsed.token, userId: parsed.user.id)
    }
}

// Response models
struct ClientResponse: Codable {
    let id: String
    let name: String
    let email: String?
    let phone: String?
    let type: String?
}

struct PropertyResponse: Codable {
    let id: String
    let title: String
    let description: String?
    let price: Double
    let address: String?
    let city: String?
    let status: String
    let bedrooms: Int
    let bathrooms: Int
    let sqft: Int
}

struct SignInResponse: Codable {
    let token: String
    let user: SignInUser
}

struct SignInUser: Codable {
    let id: String
    let email: String
    let name: String
}
