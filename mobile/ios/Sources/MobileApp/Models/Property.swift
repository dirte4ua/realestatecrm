import Foundation
import SwiftData

@Model
final class Property: Identifiable {
    @Attribute(.unique) var id: String
    var title: String
    var descriptionText: String?
    var price: Double
    var address: String?
    var city: String?
    var status: String
    var bedrooms: Int
    var bathrooms: Int
    var sqft: Int

    init(id: String = UUID().uuidString, title: String, descriptionText: String? = nil, price: Double = 0, address: String? = nil, city: String? = nil, status: String = "available", bedrooms: Int = 0, bathrooms: Int = 0, sqft: Int = 0) {
        self.id = id
        self.title = title
        self.descriptionText = descriptionText
        self.price = price
        self.address = address
        self.city = city
        self.status = status
        self.bedrooms = bedrooms
        self.bathrooms = bathrooms
        self.sqft = sqft
    }
}
