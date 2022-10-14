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
    }
}

struct WishlistView_Previews: PreviewProvider {
    static var previews: some View {
        WishlistView(store: .constant(CardCollection_Ios_IosStoreSchema()))
    }
}
