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
    @State var filterText = ""
    
    var body: some View {
        GeometryReader { metrics in
            VStack {
                List(filterList(cahcedCards, filter: filterText, id: \.cardInfo.name), id: \.id) { card in
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
                    .strikethrough(isCacheDeleted(card.id))
                    .swipeActions(edge: .trailing, allowsFullSwipe: false) {
                        Button {
                            Task {
                                guard let binderIndex = store.cachedBinders.firstIndex(where: {b in b.binderInfo.id == id}) else {
                                    throw CacheAddCardViewError.internalStateError
                                }
                                if let idx = store.cachedBinders[binderIndex].deletedCachedCards.firstIndex(of: card.id) {
                                    store.cachedBinders[binderIndex].deletedCachedCards.remove(at: idx)
                                } else {
                                    store.cachedBinders[binderIndex].deletedCachedCards.append(card.id)
                                }
                                BinderDataStore.save(storage: store) { result in
                                    if case .failure(let error) = result {
                                        fatalError(error.localizedDescription)
                                    }
                                }
                            }
                        } label: {
                            if isCacheDeleted(card.id) {
                                Label("Cache restore", systemImage: "arrow.uturn.backward.circle.fill")
                            } else {
                                Label("Cache remove", systemImage: "multiply.circle.fill")
                            }
                        }
                        .tint(colorOfRemoval(card.id))
                    }
                    .contextMenu(menuItems: {
                        Text(card.cardInfo.name)
                    }, preview: {
                        CardPreviewImageView(url: card.cardInfo.imageUri)
                    })
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
                .sheet(isPresented: $addingCard) {
                    CacheAddCardView(id:id, store: $store)
                }
                Text("Pending adds")
                List(
                    filterList(store.cachedBinders.first(where: {b in b.binderInfo.id == id})?.cacheAddedCards ?? [CardCollection_Card](), filter: filterText, id: \.cardInfo.name),
                    id:\.id) { card in
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
                    .swipeActions(edge: .trailing, allowsFullSwipe: false) {
                        Button {
                            Task {
                                guard let binderIndex = store.cachedBinders.firstIndex(where: {b in b.binderInfo.id == id}) else {
                                    throw CacheAddCardViewError.internalStateError
                                }
                                if let idx = store.cachedBinders[binderIndex].cacheAddedCards.firstIndex(where: {c in c.id == card.id}) {
                                    store.cachedBinders[binderIndex].cacheAddedCards.remove(at: idx)
                                }
                                BinderDataStore.save(storage: store) { result in
                                    if case .failure(let error) = result {
                                        fatalError(error.localizedDescription)
                                    }
                                }
                            }
                        } label: {
                            if isCacheDeleted(card.id) {
                                Label("Cache restore", systemImage: "arrow.uturn.backward.circle.fill")
                            } else {
                                Label("Cache remove", systemImage: "multiply.circle.fill")
                            }
                        }
                        .tint(colorOfRemoval(card.id))
                    }
                    .contextMenu(menuItems: {
                        Text(card.cardInfo.name)
                    }, preview: {
                        CardPreviewImageView(url: card.cardInfo.imageUri)
                    })
                }.frame(height: metrics.size.height * 0.4)
            }
        }
    }
    
    private func isCacheDeleted(_ cardId: Int32) -> Bool {
        guard let binderIndex = store.cachedBinders.firstIndex(where: {b in b.binderInfo.id == id}) else {
            return false
        }
        return store.cachedBinders[binderIndex].deletedCachedCards.contains(cardId)
    }
    
    func colorOfRemoval(_ cardId: Int32) -> Color {
        if isCacheDeleted(cardId) {
            return .blue
        }
        return .red
    }
}

struct CachedBinderView_Previews: PreviewProvider {
    static var previews: some View {
        CachedBinderView(name: "Example",id: 0, store: .constant(CardCollection_Ios_IosStoreSchema()))
    }
}
