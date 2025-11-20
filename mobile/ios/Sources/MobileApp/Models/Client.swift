import Foundation
import SwiftData

@Model
final class Client: Identifiable {
    @Attribute(.unique) var id: String
    var name: String
    var email: String?
    var phone: String?
    var type: String?

    init(id: String = UUID().uuidString, name: String, email: String? = nil, phone: String? = nil, type: String? = nil) {
        self.id = id
        self.name = name
        self.email = email
        self.phone = phone
        self.type = type
    }
}
