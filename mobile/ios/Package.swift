// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "MobileApp",
    platforms: [.iOS("17.0"), .macOS("14.0")],
    products: [
        .executable(name: "MobileApp", targets: ["MobileApp"]),
    ],
    targets: [
        .executableTarget(
            name: "MobileApp",
            path: "Sources/MobileApp",
            resources: [
                // Add resources if needed
            ]
        ),
    // no test target configured
    ]
)
