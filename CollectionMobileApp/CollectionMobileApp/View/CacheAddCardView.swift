//
//  CacheAddCardView.swift
//  CollectionMobileApp
//
//  Created by Kevin on 10/2/22.
//

import SwiftUI

fileprivate struct PendingCard {
fileprivate struct PendingCachedCard {
    var index: Int
    var name: String
    var id: String
    var setName: String
    var version: String?
}

enum CacheAddCardViewError: Error {
    case internalStateError
}

struct CacheAddCardView: View {
    var id: Int32
    @State private var cards = [ScryfallCard]()
    @State private var searchText = ""
    @State private var cardsToAdd = [PendingCachedCard]()
    @State var nextCardId = 0
    @State private var confirmingAddCards: Bool = false
    @Binding var store: CardCollection_Ios_IosStoreSchema
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationView {
            GeometryReader { metrics in
                VStack{
                    List(cards, id:\.scryfallId) { card in
                        HStack{
                            Text(card.name)
                            if let cid = card.collectorId {
                                if cid != "" {
                                    Text(" (\(cid))")
                                        .foregroundColor(.secondary)
                                }
                            }
                            Spacer()
                            Text(card.setName)
                                .foregroundColor(.secondary)
                        }
                        .contextMenu(menuItems: createMenuItem(info: card), preview: {
                            CardPreviewImageView(url: card.imageUrl)
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
                                    guard var binder = store.cachedBinders.first(where: {b in b.binderInfo.id == id}) else {
                                        throw CacheAddCardViewError.internalStateError
                                    }
                                    var idNext = binder.nextCacheAddedCardID
                                    var cardsToAdd = cardsToAdd.map({card in
                                        idNext += 1
                                        var pendingCard = CardCollection_Card()
                                        pendingCard.id = idNext
                                        pendingCard.binderID = id
                                        if let v = card.version {
                                            pendingCard.version = v
                                        }
                                        var pendingCardInfo = CardCollection_CardInfo()
                                        pendingCardInfo.name = card.name
                                        pendingCardInfo.setName = card.setName
                                        pendingCardInfo.id = card.id
                                    })
                                    binder.nextCacheAddedCardID = idNext
                                    binder.cacheAddedCards
                                    store
                                    dismiss()
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    private func buildCardToAdd(name: String, id: String, setName: String, version: String? = nil) -> PendingCachedCard {
        nextCardId += 1
        return PendingCachedCard(index: nextCardId, name: name, id: id, setName: setName, version: version.flatMap { $0 != "nonfoil" ? $0 : nil })
    }
    
    private func createMenuItem(info: ScryfallCard) -> () -> AnyView {
        if info.versions.count == 0 {
            return { AnyView(
                Button {
                    cardsToAdd.append(buildCardToAdd(name: info.name, id: info.scryfallId, setName: info.setName))
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
                            cardsToAdd.append(buildCardToAdd(name: info.name, id: info.scryfallId, setName: info.setName, version: version))
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
                cards = try ScryfallClient.queryCardFromScryfall(name: searchText)
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
        CacheAddCardView(id:0, store: .constant(CardCollection_Ios_IosStoreSchema()))
    }
}
