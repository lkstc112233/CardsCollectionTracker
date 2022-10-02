//
//  BinderView.swift
//  CollectionMobileApp
//
//  Created by Kevin on 9/27/22.
//

import SwiftUI

struct BinderView: View {
    var name: String
    var id: Int32
    @State var cards: [IdentifiableWrapper<CardCollection_Card, Int32>] = []
    @State var error: Bool = false
    @State var addingCard: Bool = false
    
    var body: some View {
        NavigationView {
            if error {
                VStack {
                    Text("Unable to load collections")
                    Button("Retry") {
                        Task {
                            await loadCardsInBinder()
                        }
                    }
                }
                .navigationTitle(name)
                .navigationBarTitleDisplayMode(.inline)
            } else {
                List(cards) { card in
                    HStack {
                        if card.value.cardInfo.printedName != "" {
                            Text(card.value.cardInfo.printedName)
                        } else {
                            Text(card.value.cardInfo.name)
                        }
                        if card.value.version != "" {
                            Text(" (\(card.value.version))")
                                .foregroundColor(.secondary)
                        }
                        Spacer()
                        Text(card.value.cardInfo.setName)
                            .foregroundColor(.secondary)
                    }
                    .contextMenu(menuItems: {
                        Text(card.value.cardInfo.name)
                    }, preview: {
                        CardPreviewImageView(url: card.value.cardInfo.imageUri)
                    })
                }
                .refreshable {
                    await loadCardsInBinder()
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
                .sheet(isPresented: $addingCard, onDismiss: {
                    Task {
                        await loadCardsInBinder()
                    }
                }) {
                    AddCardView(id:id)
                }
            }
        }
        .task{
            await loadCardsInBinder()
        }
    }
    
    func loadCardsInBinder() async {
        do {
            self.cards = try await GrpcClient.listCardsInBinder(id: id ).map({ card in
                wrapIdentifiable(value: card, getId: {c in c.id})
            })
            error = false
        } catch {
            self.error = true
            self.cards = []
            print("Error happened loading cards in binders: " + error.localizedDescription)
        }
    }
}

struct BinderView_Previews: PreviewProvider {
    static var previews: some View {
        BinderView(name: "Example", id: 0)
    }
}
