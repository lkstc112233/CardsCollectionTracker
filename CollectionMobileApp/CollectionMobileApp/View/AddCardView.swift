//
//  AddCardView.swift
//  CollectionMobileApp
//
//  Created by Kevin on 10/1/22.
//

import SwiftUI

struct AddCardView: View {
    var id: Int32
    @State private var cards = [IdentifiableWrapper<CardCollection_CardInfo, String>]()
    @State private var searchText = ""
    
    var body: some View {
        NavigationView {
            List(cards) { card in
                Text(card.value.name)
            }
            .searchable(text: $searchText, prompt: "Card Name")
            .navigationTitle("Add Card")
            .navigationBarTitleDisplayMode(.inline)
        }
        .onSubmit(of: .search, runSearch)
    }

    func runSearch() {
                cards = []
    }
}

struct AddCardView_Previews: PreviewProvider {
    static var previews: some View {
        AddCardView(id:0)
    }
}
