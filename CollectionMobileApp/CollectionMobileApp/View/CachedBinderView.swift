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
                Button{
                    addingCard.toggle()
                } label: {
                    Label("Add card", systemImage: "plus.circle")
                }
            }
            .sheet(isPresented: $addingCard) {
//                AddCardView(id:id)
            }
        }
    }
}

struct CachedBinderView_Previews: PreviewProvider {
    static var previews: some View {
        CachedBinderView(name: "Example",id: 0, cahcedCards: [])
    }
}
