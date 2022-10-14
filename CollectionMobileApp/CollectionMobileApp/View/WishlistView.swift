//
//  WishlistView.swift
//  CollectionMobileApp
//
//  Created by Kevin on 10/13/22.
//

import SwiftUI

struct WishlistView: View {
    @Binding var store: CardCollection_Ios_IosStoreSchema
    
    var body: some View {
        Text("Wishlist goes here")
    
    func loadWishlist() async {
        do {
            let loadedWishlist = try await GrpcClient.listWishlist()
            DispatchQueue.main.async {
                store.cachedWishlist = loadedWishlist
                BinderDataStore.save(storage: store) { result in
                    if case .failure(let error) = result {
                        fatalError(error.localizedDescription)
                    }
                }
            }
        } catch {
            print("Error happened loading wishlist: " + error.localizedDescription)
        }
    }
    
    private func refreshStorage() {
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

struct WishlistView_Previews: PreviewProvider {
    static var previews: some View {
        WishlistView(store: .constant(CardCollection_Ios_IosStoreSchema()))
    }
}
