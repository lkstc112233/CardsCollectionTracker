//
//  CollectionView.swift
//  CollectionMobileApp
//
//  Created by Kevin on 9/27/22.
//

import SwiftUI

struct CollectionView: View {
    @State var binders: [IdentifiableWrapper<CardCollection_Binder, Int32>] = []
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
                List(binders) { binder in
                    NavigationLink{
                        BinderView(name: binder.value.name)
                    }label: {
                        HStack{
                            Text(binder.value.name)
                            Spacer()
                            Text(String(binder.value.cardCount))
                                .foregroundColor(.secondary)
                        }
                    }
                }
                .refreshable {
                    await loadBinders()
                }
                .navigationTitle("Collections")
            }
        }
        .task{
            await loadBinders()
        }
    }
    
    func loadBinders() async {
        do {
            self.binders = try await GrpcClient.client.listBinders(CardCollection_Service_ListBindersRequest()).binders.map({ binder in
                IdentifiableWrapper(value: binder, getId: {b in b.id})
            })
            error = false
        } catch {
            self.error = true
            self.binders = []
            print("Error happened loading binders: " + error.localizedDescription)
        }
    }
}

struct CollectionView_Previews: PreviewProvider {
    static var previews: some View {
        CollectionView()
    }
}
