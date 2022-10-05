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
                        if binder.cacheAddedCards.count > 0 {
                            Text("+\(binder.cacheAddedCards.count)")
                                .foregroundColor(.green)
                        }
                        if binder.deletedCachedCards.count > 0 {
                            Text("-\(binder.deletedCachedCards.count)")
                                .foregroundColor(.red)
                        }
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
                                var delta = 0
                                do {
                                    let added = store.cachedBinders[binderIndex].cacheAddedCards.count
                                    if added > 0 {
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
                                        delta += added
                                    }
                                    let deleted = store.cachedBinders[binderIndex].deletedCachedCards.count
                                    if deleted > 0 {
                                        try await GrpcClient.deleteCardInCollection(ids: store.cachedBinders[binderIndex].deletedCachedCards)
                                        store.cachedBinders[binderIndex].deletedCachedCards.removeAll()
                                        anySyncAction = true
                                        delta -= deleted
                                    }
                                } catch {
                                    print("error happened while syncing cached changes.")
                                    print(error)
                                }
                                if anySyncAction {
                                    let response = try await GrpcClient.listCardsInBinderResponse(id: binder.binderInfo.id)
                                    var binderInfo = binder.binderInfo
                                    binderInfo.cardCount += Int32(delta)
                                    BinderDataStore.mergeBinderIntoStorage(storage: &store, binderInfo: binderInfo, response: response)
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
