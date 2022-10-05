//
//  TradingView.swift
//  CollectionMobileApp
//
//  Created by Kevin on 9/27/22.
//

import SwiftUI

struct TradingView: View {
    @Binding var store: CardCollection_Ios_IosStoreSchema
    @State private var confirmSyncing: Bool = false

    var body: some View {
        NavigationView {
            List(store.cachedBinders, id:\.binderInfo.id) { binder in
                NavigationLink{
                    CachedBinderView(name: binder.binderInfo.name, id: binder.binderInfo.id, cahcedCards: binder.cardsInBinder.cards, store: $store)
                }label: {
                    HStack{
                        Text(binder.binderInfo.name)
                        Spacer()
                        Text(String(binder.binderInfo.cardCount))
                            .foregroundColor(.secondary)
                        Text("(\(calculateCacheCardDelta(binder)))")
                            .foregroundColor(getColorForDelta(calculateCacheCardDelta(binder)))
                    }
                    .swipeActions(edge: .trailing, allowsFullSwipe: false) {
                        Button() {
                            confirmSyncing = true
                        } label: {
                            Label("Cache to local", systemImage: "arrow.triangle.2.circlepath.circle.fill")
                        }
                        .tint(.blue)
                    }
                    .confirmationDialog("Sync card changes with collection server?", isPresented: $confirmSyncing) {
                        Button("Sync card changes") {
                            Task {
                                guard let binderIndex = store.cachedBinders.firstIndex(where: {b in b.binderInfo.id == binder.binderInfo.id}) else {
                                    throw CacheAddCardViewError.internalStateError
                                }
                                var anySyncAction = false
                                do {
                                    if store.cachedBinders[binderIndex].cacheAddedCards.count > 0 {
                                        try await GrpcClient.addCardToCollection(cards: store.cachedBinders[binderIndex]
                                            .cacheAddedCards.map({cache in
                                                var card = CardToAdd(id: cache.cardInfo.id)
                                                if cache.version != "" {
                                                    card.version = cache.version
                                                }
                                                return card
                                            }), binderId: binder.binderInfo.id)
                                        store.cachedBinders[binderIndex].cacheAddedCards.removeAll()
                                        anySyncAction = true
                                    }
                                    if store.cachedBinders[binderIndex].deletedCachedCards.count > 0 {
                                        try await GrpcClient.deleteCardInCollection(ids: store.cachedBinders[binderIndex].deletedCachedCards)
                                        store.cachedBinders[binderIndex].deletedCachedCards.removeAll()
                                        anySyncAction = true
                                    }
                                } catch {
                                    print("error happened while syncing cached changes.")
                                    print(error)
                                }
                                if anySyncAction {
                                    BinderDataStore.save(storage: store) { result in
                                        if case .failure(let error) = result {
                                            fatalError(error.localizedDescription)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            .navigationTitle("Cached Binders")
            .navigationBarTitleDisplayMode(.inline)
        }
        .onAppear {
            refreshStorage()
        }
    }
    
    private func calculateCacheCardDelta(_ binder: CardCollection_Ios_IosStoreSchema.CachedBinders) -> Int {
        return binder.cacheAddedCards.count - binder.deletedCachedCards.count
    }
    
    private func getColorForDelta(_ delta: Int) -> Color {
        if delta > 0 {
            return .green
        } else if delta < 0 {
            return .red
        }
        return .secondary
    }
    
    private func refreshStorage() {
        BinderDataStore.load { result in
            switch result {
            case .failure(let error):
                fatalError(error.localizedDescription)
            case .success(let storage):
                store = storage
            }
        }
    }
}

struct TradingView_Previews: PreviewProvider {
    static var previews: some View {
        TradingView(store: .constant(CardCollection_Ios_IosStoreSchema()))
    }
}
