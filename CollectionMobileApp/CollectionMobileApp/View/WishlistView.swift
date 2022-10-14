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
            self.wishlist = try await GrpcClient.listWishlist()
            error = false
        } catch {
            self.error = true
            self.wishlist = []
            print("Error happened loading binders: " + error.localizedDescription)
        }
    }
}

struct WishlistView_Previews: PreviewProvider {
    static var previews: some View {
        WishlistView(store: .constant(CardCollection_Ios_IosStoreSchema()))
    }
}
