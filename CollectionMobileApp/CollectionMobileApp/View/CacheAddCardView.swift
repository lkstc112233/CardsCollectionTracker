//
//  CacheAddCardView.swift
//  CollectionMobileApp
//
//  Created by Kevin on 10/2/22.
//

import SwiftUI

fileprivate struct PendingCachedCard {
    var index: Int
    var name: String
    var id: String
    var setName: String
    var imageUrl: String
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
                            Task {
                                guard let binderIndex = store.cachedBinders.firstIndex(where: {b in b.binderInfo.id == id}) else {
                                    throw CacheAddCardViewError.internalStateError
                                }
                                var idNext = store.cachedBinders[binderIndex].nextCacheAddedCardID
                                let cardsToAdd = cardsToAdd.map({card in
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
                                    pendingCardInfo.imageUri = card.imageUrl
                                    pendingCard.cardInfo = pendingCardInfo
                                    return pendingCard
                                })
                                store.cachedBinders[binderIndex].nextCacheAddedCardID = idNext
                                store.cachedBinders[binderIndex].cacheAddedCards.append(contentsOf: cardsToAdd)
                                BinderDataStore.save(storage: store) { result in
                                    if case .failure(let error) = result {
                                        fatalError(error.localizedDescription)
                                    }
                                    dismiss()
                                }
                            }
                        } label: {
                            Label("Confirm Add", systemImage: "plus.circle")
                        }
                        .disabled(cardsToAdd.isEmpty)
                    }
                }
            }
        }
    }
    
    private func buildCardToAdd(name: String, id: String, imageUrl: String, setName: String, version: String? = nil) -> PendingCachedCard {
        nextCardId += 1
        return PendingCachedCard(index: nextCardId, name: name, id: id, setName: setName, imageUrl: imageUrl, version: version.flatMap { $0 != "nonfoil" ? $0 : nil })
    }
    
    private func createMenuItem(info: ScryfallCard) -> () -> AnyView {
        if info.versions.count == 0 {
            return { AnyView(
                Button {
                    cardsToAdd.append(buildCardToAdd(name: info.name, id: info.scryfallId, imageUrl: info.imageUrl, setName: info.setName))
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
                            cardsToAdd.append(buildCardToAdd(name: info.name, id: info.scryfallId, imageUrl: info.imageUrl, setName: info.setName, version: version))
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
