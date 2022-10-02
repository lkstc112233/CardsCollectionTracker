//
//  TradingView.swift
//  CollectionMobileApp
//
//  Created by Kevin on 9/27/22.
//

import SwiftUI

struct TradingView: View {
    @Binding var store: CardCollection_Ios_IosStoreSchema

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
        TradingView(store: .constant(CardCollection_Ios_IosStoreSchema()))
    }
}
