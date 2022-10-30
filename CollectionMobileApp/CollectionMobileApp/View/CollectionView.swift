//
//  CollectionView.swift
//  CollectionMobileApp
//
//  Created by Kevin on 9/27/22.
//

import SwiftUI

struct CollectionView: View {
    @Binding var store: CardCollection_Ios_IosStoreSchema
    @State var binders: [CardCollection_Binder] = []
    @State var error: Bool = false
    @State var filterText = ""
    @State private var confirmingReturningCards: Bool = false
    @State private var deckToReturn: CardCollection_Binder? = nil
    
    var body: some View {
        NavigationView {
            if error {
                VStack {
                    Text("Unable to load collections")
                    Button("Retry") {
                        Task {
                            await loadBinders()
                        }
                    }
                }
            } else {
                List(filterList(binders, filter: filterText, id: \.name), id:\.id) { binder in
                    NavigationLink{
                        BinderView(name: binder.name, id: binder.id)
                    }label: {
                        HStack{
                            Text(binder.name)
                            Spacer()
                            Text(String(binder.cardCount))
                                .foregroundColor(.secondary)
                            if binder.rentOutCount != 0 {
                                Text("(-\(binder.rentOutCount))")
                                    .foregroundColor(.secondary)
                            }
                        }
                        .swipeActions(edge: .trailing, allowsFullSwipe: false) {
                            Button() {
                                Task {
                                    if binder.type == .deck {
                                        deckToReturn = binder
                                        confirmingReturningCards = true
                                    } else {
                                        if let response = await loadCardsInBinder(id: binder.id) {
                                            BinderDataStore.mergeBinderIntoStorage(storage: &store, binderInfo: binder, response: response)
                                            BinderDataStore.save(storage: store) { result in
                                                if case .failure(let error) = result {
                                                    fatalError(error.localizedDescription)
                                                }
                                            }
                                        }
                                    }
                                }
                            } label: {
                                if binder.type == .deck {
                                    Label("Return all cards", systemImage: "arrow.counterclockwise.circle")
                                } else {
                                    Label("Cache to local", systemImage: "archivebox.fill")
                                }
                            }
                            .tint(getBinderSwipeButtonColor(binder.type))
                            .disabled(shouldDisableSwipeAction(binder))
                        }
                    }
                    .listRowBackground(Color(uiColor: getBackgroundColorForBinder(binder.type)))
                }
                .refreshable {
                    await loadBinders()
                }
                .searchable(text: $filterText, prompt: "Filter...")
                .disableAutocorrection(true)
                .navigationTitle("Collections")
                .navigationBarTitleDisplayMode(.inline)
                .confirmationDialog("Return all cards in binder?", isPresented: $confirmingReturningCards) {
                    Button("Return all cards in binder") {
                        Task {
                            do {
                                try await GrpcClient.returnAllCardsInDeck(id: deckToReturn!.id)
                            } catch {
                                print("Error happened while returning cards: " + error.localizedDescription)
                            }
                            deckToReturn = nil
                        }
                    }
                }
            }
        }
        .task{
            await loadBinders()
        }
    }
    
    private func shouldDisableSwipeAction(_ binder: CardCollection_Binder) -> Bool {
        if binder.type != .deck {
            return false
        }
        return binder.cardCount == 0
    }
    
    private func getBinderSwipeButtonColor(_ binderType: CardCollection_Binder.BinderType) -> Color {
        if binderType == .deck {
            return .red
        }
        return .orange
    }
    private func getBackgroundColorForBinder(_ binderType: CardCollection_Binder.BinderType) -> UIColor {
        if (binderType == .deck) {
            return .tertiarySystemBackground
        }
        return .secondarySystemBackground
    }
    
    func loadBinders() async {
        do {
            self.binders = try await GrpcClient.listBinders()
            error = false
        } catch {
            self.error = true
            self.binders = []
            print("Error happened loading binders: " + error.localizedDescription)
        }
    }
    
    func returnAllCardsInDeck(id: Int32) async {
        do {
            try await GrpcClient.returnAllCardsInDeck(id: id)
        } catch {
            return
        }
    }
    
    func loadCardsInBinder(id: Int32) async -> CardCollection_Service_ListCardInBinderResponse? {
        do {
            return try await GrpcClient.listCardsInBinderResponse(id: id)
        } catch {
            return nil
        }
    }
}

struct CollectionView_Previews: PreviewProvider {
    static var previews: some View {
        CollectionView(store: .constant(CardCollection_Ios_IosStoreSchema()))
    }
}
