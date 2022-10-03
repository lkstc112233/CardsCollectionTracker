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
            List(store.cachedBinders, id:\.binderInfo.id) { binder in
                NavigationLink{
                    CachedBinderView(name: binder.binderInfo.name)
                }label: {
                    HStack{
                        Text(binder.binderInfo.name)
                        Spacer()
                        Text(String(binder.binderInfo.cardCount))
                            .foregroundColor(.secondary)
                    }
                }
            }
            .navigationTitle("Cached Binders")
            .navigationBarTitleDisplayMode(.inline)
            .refreshable {
                BinderDataStore.load { result in
                    switch result {
                    case .failure(let error):
                        fatalError(error.localizedDescription)
                    case .success(let storage):
                        store = storage
                    }
                }
            }
        }
        .onAppear {
            BinderDataStore.load { result in
                switch result {
                case .failure(let error):
                    fatalError(error.localizedDescription)
                case .success(let storage):
                    store = storage
                }
            }
        }
    }
}

struct TradingView_Previews: PreviewProvider {
    static var previews: some View {
        TradingView(store: .constant(CardCollection_Ios_IosStoreSchema()))
    }
}
