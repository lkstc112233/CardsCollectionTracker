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
                List(binders, id:\.id) { binder in
                    NavigationLink{
                        BinderView(name: binder.name, id: binder.id)
                    }label: {
                        HStack{
                            Text(binder.name)
                            Spacer()
                            Text(String(binder.cardCount))
                                .foregroundColor(.secondary)
                        }
                        .swipeActions(edge: .trailing, allowsFullSwipe: false) {
                            Button() {
                                Task {
                                    if let response = await loadCardsInBinder(id: binder.id) {
                                        BinderDataStore.mergeBinderIntoStorage(storage: &store, binderInfo: binder, response: response)
                                        BinderDataStore.save(storage: store) { result in
                                            if case .failure(let error) = result {
                                                fatalError(error.localizedDescription)
                                            }
                                        }
                                    }
                                }
                            } label: {
                                Label("Cache to local", systemImage: "archivebox.fill")
                            }
                            .tint(.orange)
                        }
                    }
                }
                .refreshable {
                    await loadBinders()
                }
                .navigationTitle("Collections")
                .navigationBarTitleDisplayMode(.inline)
            }
        }
        .task{
            await loadBinders()
        }
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
