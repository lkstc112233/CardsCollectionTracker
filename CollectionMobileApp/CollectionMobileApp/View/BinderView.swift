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
    @State var cards: [CardCollection_Card] = []
    @State var error: Bool = false
    @State var addingCard: Bool = false
    @State var filterText = ""
    
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
                List(filterList(cards, filter: filterText, id: \.cardInfo.name), id: \.id) { card in
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
                .refreshable {
                    await loadCardsInBinder()
                }
                .searchable(text: $filterText, prompt: "Filter...")
                .disableAutocorrection(true)
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
            self.cards = try await GrpcClient.listCardsInBinder(id: id)
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
