//
//  ContentView.swift
//  CollectionMobileApp
//
//  Created by Kevin on 9/26/22.
//

import SwiftUI

struct AppMainView: View {
    var body: some View {
        TabView {
            CollectionView()
                .tabItem{Label("Collections", systemImage: "tray.fill")
                }
            TradingView()
                .tabItem {Label("Trading", systemImage: "arrow.left.arrow.right")}
            SettingsView()
                .tabItem{
                    Label("Settings", systemImage: "slider.horizontal.3")
                }
        }
    }
}

struct AppMainView_Previews: PreviewProvider {
    static var previews: some View {
        AppMainView()
    }
}
