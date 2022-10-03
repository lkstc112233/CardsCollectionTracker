//
//  CacheAddCardView.swift
//  CollectionMobileApp
//
//  Created by Kevin on 10/2/22.
//

import SwiftUI

fileprivate struct PendingCard {
    var index: Int
    var name: String
    var id: String
    var version: String?
}

struct CacheAddCardView: View {
    var id: Int32
    @State private var cards = [CardCollection_CardInfo]()
    @State private var searchText = ""
    @State private var cardsToAdd = [PendingCard]()
    @State var nextCardId = 0
    @State private var confirmingAddCards: Bool = false
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationView {
            GeometryReader { metrics in
                VStack{
                    List(cards, id:\.id) { card in
                        HStack{
                            Text(card.name)
                            if card.collectorsID != "" {
                                Text(" (\(card.collectorsID))")
                                    .foregroundColor(.secondary)
                            }
                            Spacer()
                            Text(card.setName)
                                .foregroundColor(.secondary)
                        }
                        .contextMenu(menuItems: createMenuItem(info: card), preview: {
                            CardPreviewImageView(url: card.imageUri)
                        })
                    }
                    .searchable(text: $searchText, prompt: "Card Name")
                    .disableAutocorrection(true)
                    .navigationTitle("Add Card")
                    .navigationBarTitleDisplayMode(.inline)
                    .onSubmit(of: .search, runSearch)
                    List(cardsToAdd, id: \.index) { c in
                        HStack{
                            Text(c.name)
                            Spacer()
                            Text(c.version ?? "")
                                .foregroundColor(.secondary)
                        }
                        .swipeActions(edge: .trailing, allowsFullSwipe: false) {
                            Button(role: .destructive) {
                                if let index = cardsToAdd.firstIndex(where: {card in card.index == c.index}) {
                                    cardsToAdd.remove(at: index)
                                }
                            } label: {
                                Label("Cancel Add", systemImage: "multiply.circle.fill")
                            }
                        }
                    }.frame(height: metrics.size.height * 0.2)
                }
                .toolbar{
                    ToolbarItem(placement: .navigationBarTrailing){
                        Button{
                            confirmingAddCards = true
                        } label: {
                            Label("Confirm Add", systemImage: "plus.circle")
                        }
                        .disabled(cardsToAdd.isEmpty)
                        .confirmationDialog("Add \(cardsToAdd.count) card(s)?", isPresented: $confirmingAddCards) {
                            Button("Add \(cardsToAdd.count) card(s)") {
                                Task {
                                    // TODO: Add card
                                    dismiss()
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    private func buildCardToAdd(name: String, id: String, version: String? = nil) -> PendingCard {
        nextCardId += 1
        return PendingCard(index: nextCardId, name: name, id: id, version: version)
    }
    
    private func createMenuItem(info: CardCollection_CardInfo) -> () -> AnyView {
        if info.versions.count == 0 {
            return { AnyView(
                Button {
                    cardsToAdd.append(buildCardToAdd(name: info.name, id: info.id))
                }label: {
                    Label("Add Card", systemImage: "plus.circle")
                }
            )
            }
        } else {
            return {
                AnyView(
                    ForEach(info.versions, id: \.self) { version in
                        Button {
                            cardsToAdd.append(buildCardToAdd(name: info.name, id: info.id, version: version))
                        }label: {
                            Label(version, systemImage: "plus.circle")
                        }
                    }
                )
            }
        }
    }

    func runSearch() {
        if searchText.isEmpty {
            return
        }
        Task {
            do {
                try ScryfallClient.queryCardFromScryfall(name: searchText)
                cards = []
                print("Found \(cards.count) cards.")
            } catch {
                cards = []
                print("Error happened loading cards to add: " + error.localizedDescription)
            }
            searchText = ""
        }
    }
}

struct CacheAddCardView_Previews: PreviewProvider {
    static var previews: some View {
        CacheAddCardView(id:0)
    }
}
