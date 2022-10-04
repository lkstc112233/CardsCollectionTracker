//
//  CachedBinderView.swift
//  CollectionMobileApp
//
//  Created by Kevin on 9/27/22.
//

import SwiftUI

struct CachedBinderView: View {
    var name: String
    var id: Int32
    var cahcedCards: [CardCollection_Card] = []
    @Binding var store: CardCollection_Ios_IosStoreSchema
    @State var addingCard: Bool = false
    
    var body: some View {
        NavigationView {
            List(cahcedCards, id: \.id) { card in
                HStack {
                    if card.cardInfo.printedName != "" {
                        Text(card.cardInfo.printedName)
                    } else {
                        Text(card.cardInfo.name)
                    }
                    if card.version != "" {
                        Text(" (\(card.version))")
                            .foregroundColor(.secondary)
                    }
                    Spacer()
                    Text(card.cardInfo.setName)
                        .foregroundColor(.secondary)
                }
                .contextMenu(menuItems: {
                    Text(card.cardInfo.name)
                }, preview: {
                    CardPreviewImageView(url: card.cardInfo.imageUri)
                })
            }
            .navigationTitle(name)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar{
                ToolbarItem(placement: .navigationBarTrailing){
                    Button{
                        addingCard.toggle()
                    } label: {
                        Label("Add card", systemImage: "plus.circle")
                    }
                }
            }
            .sheet(isPresented: $addingCard) {
                CacheAddCardView(id:id, store: $store)
            }
        }
    }
}

struct CachedBinderView_Previews: PreviewProvider {
    static var previews: some View {
        CachedBinderView(name: "Example",id: 0, store: .constant(CardCollection_Ios_IosStoreSchema()))
    }
}
