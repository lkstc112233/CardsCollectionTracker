//
//  CollectionView.swift
//  CollectionMobileApp
//
//  Created by Kevin on 9/27/22.
//

import SwiftUI

struct IdentifiableBinder : Identifiable {
    var binder: CardCollection_Binder
    var id: Int32
    init(binder: CardCollection_Binder) {
        self.binder = binder
        self.id = binder.id
    }
}

struct CollectionView: View {
    @State var binders: [IdentifiableBinder] = []
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
                        BinderView(name: binder.binder.name)
                    }label: {
                        Text(binder.binder.name)
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
        print("Loading binders")
        do {
            self.binders = try await GrpcClient.client.listBinders(CardCollection_Service_ListBindersRequest()).binders.map({ binder in
                IdentifiableBinder(binder: binder)
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
