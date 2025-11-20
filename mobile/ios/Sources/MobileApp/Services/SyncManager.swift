import Foundation
import SwiftData

actor SyncManager {
    static let shared = SyncManager()

    func syncClients(modelContext: ModelContext, token: String?) async throws {
        let fetched = try await API.fetchClients(token: token)
        for c in fetched {
            // upsert
            if let existing = try modelContext.fetch(EntityQuery<Client>().filter(#Predicate { $0.id == c.id })).first {
                existing.name = c.name
                existing.email = c.email
                existing.phone = c.phone
                existing.type = c.type
            } else {
                let newClient = Client(id: c.id, name: c.name, email: c.email, phone: c.phone, type: c.type)
                modelContext.insert(newClient)
            }
        }
        try modelContext.save()
    }

    func syncProperties(modelContext: ModelContext, token: String?) async throws {
        let fetched = try await API.fetchProperties(token: token)
        for p in fetched {
            if let existing = try modelContext.fetch(EntityQuery<Property>().filter(#Predicate { $0.id == p.id })).first {
                existing.title = p.title
                existing.descriptionText = p.description
                existing.price = p.price
                existing.address = p.address
                existing.city = p.city
                existing.status = p.status
                existing.bedrooms = p.bedrooms
                existing.bathrooms = p.bathrooms
                existing.sqft = p.sqft
            } else {
                let newProp = Property(id: p.id, title: p.title, descriptionText: p.description, price: p.price, address: p.address, city: p.city, status: p.status, bedrooms: p.bedrooms, bathrooms: p.bathrooms, sqft: p.sqft)
                modelContext.insert(newProp)
            }
        }
        try modelContext.save()
    }
}
