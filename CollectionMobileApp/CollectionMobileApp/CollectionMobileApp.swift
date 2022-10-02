//
//  CollectionMobileAppApp.swift
//  CollectionMobileApp
//
//  Created by Kevin on 9/26/22.
//

import SwiftUI

@main
struct CollectionMobileApp: App {
    @StateObject private var store = BinderDataStore()
    var body: some Scene {
        WindowGroup {
            AppMainView(store: $store.storage)
        }
    }
}
