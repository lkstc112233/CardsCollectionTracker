//
//  TradingView.swift
//  CollectionMobileApp
//
//  Created by Kevin on 9/27/22.
//

import SwiftUI

struct TradingView: View {
    var body: some View {
        NavigationView {
            List {
                NavigationLink{
                    CachedBinderView(name: "Unbinded")
                }label: {
                    Text("Trading")
                }
            }
            .navigationTitle("Cached Binders")
            .refreshable {
                // gRPC
            }
        }
    }
}

struct TradingView_Previews: PreviewProvider {
    static var previews: some View {
        TradingView()
    }
}
