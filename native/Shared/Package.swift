// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CrotchetShared",
    platforms: [
        .iOS(.v16),
        .macOS(.v13)
    ],
    products: [
        .library(
            name: "CrotchetShared",
            targets: ["CrotchetShared"]
        ),
    ],
    targets: [
        .target(
            name: "CrotchetShared",
            path: "Sources"
        )
    ]
)
