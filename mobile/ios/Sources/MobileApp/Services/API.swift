import Foundation

enum APIError: Error {
    case invalidURL
    case invalidResponse
    case serverError(String)
    
    var localizedDescription: String {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .invalidResponse:
            return "Invalid response from server"
        case .serverError(let message):
            return message
        }
    }
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
        guard let http = resp as? HTTPURLResponse else { throw APIError.invalidResponse }
        
        if !((200...299).contains(http.statusCode)) {
            if let errorData = try? JSONDecoder().decode(ErrorResponse.self, from: data) {
                throw APIError.serverError(errorData.error)
            } else {
                throw APIError.serverError("Login failed with status \(http.statusCode)")
            }
        }
        
        let parsed = try JSONDecoder().decode(SignInResponse.self, from: data)
        return (token: parsed.token, userId: parsed.user.id)
    }
    
    static func signUp(name: String, email: String, password: String) async throws -> String {
        guard let url = URL(string: "/api/auth/signup", relativeTo: baseURL) else { throw APIError.invalidURL }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body = ["name": name, "email": email, "password": password]
        req.httpBody = try JSONEncoder().encode(body)

        let (data, resp) = try await URLSession.shared.data(for: req)
        guard let http = resp as? HTTPURLResponse else { throw APIError.invalidResponse }
        
        if !((200...299).contains(http.statusCode)) {
            if let errorData = try? JSONDecoder().decode(ErrorResponse.self, from: data) {
                throw APIError.serverError(errorData.error)
            } else {
                throw APIError.serverError("Signup failed with status \(http.statusCode)")
            }
        }
        
        let parsed = try JSONDecoder().decode(SignUpResponse.self, from: data)
        return parsed.message
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

struct ErrorResponse: Codable {
    let error: String
}

struct SignUpResponse: Codable {
    let message: String
    let user: SignInUser
}
