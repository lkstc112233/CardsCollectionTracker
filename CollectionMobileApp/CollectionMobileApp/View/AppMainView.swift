//
//  ContentView.swift
//  CollectionMobileApp
//
//  Created by Kevin on 9/26/22.
//

import SwiftUI

struct AppMainView: View {
    @Binding var store: CardCollection_Ios_IosStoreSchema
    var body: some View {
        TabView {
            CollectionView(store: $store)
                .tabItem{Label("Collections", systemImage: "tray.fill")
                }
            TradingView(store: $store)
                .tabItem {Label("Trading", systemImage: "arrow.left.arrow.right")}
            SettingsView(store: $store)
                .tabItem{
                    Label("Settings", systemImage: "slider.horizontal.3")
                }
        }
    }
}

struct AppMainView_Previews: PreviewProvider {
    static var previews: some View {
        AppMainView(store: .constant(CardCollection_Ios_IosStoreSchema()))
    }
}
