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
    @State var cacheAddedCards: [CardCollection_Card] = []
    @Binding var store: CardCollection_Ios_IosStoreSchema
    @State var addingCard: Bool = false
    
    var body: some View {
        GeometryReader { metrics in
            VStack {
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
                .sheet(isPresented: $addingCard, onDismiss: setCacheAddedCards) {
                    CacheAddCardView(id:id, store: $store)
                }
                List(cacheAddedCards, id:\.id) { card in
                    HStack {
                        Text(card.cardInfo.name)
                        if card.version != "" {
                            Text(" (\(card.version))")
                                .foregroundColor(.secondary)
                        }
                        Spacer()
                        Text(card.cardInfo.setName)
                            .foregroundColor(.secondary)
                    }
                }.frame(height: metrics.size.height * 0.2)
            }
        }
    }
    
    private func setCacheAddedCards() {
        guard let binder = store.cachedBinders.first(where: {b in b.binderInfo.id == id}) else {
            cacheAddedCards = []
            return
        }
        cacheAddedCards = binder.cacheAddedCards
    }
}

struct CachedBinderView_Previews: PreviewProvider {
    static var previews: some View {
        CachedBinderView(name: "Example",id: 0, store: .constant(CardCollection_Ios_IosStoreSchema()))
    }
}
