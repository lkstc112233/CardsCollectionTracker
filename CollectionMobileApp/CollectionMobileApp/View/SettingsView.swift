//
//  SettingsView.swift
//  CollectionMobileApp
//
//  Created by Kevin on 9/27/22.
//

import SwiftUI

struct SettingsView: View {
    @AppStorage("ServerAddress") var defaults: String = "localhost:33333"
    @Binding var store: CardCollection_Ios_IosStoreSchema
    @State var deleteAllDataConfirm1 = false
    @State var deleteAllDataConfirm2 = false
    
    var body: some View {
        VStack{
            Form {
                HStack {
                    Text("Collection Server")
                    TextField(text: $defaults, prompt: Text("localhost:33333")) {
                        Text("Collection Server")
                    }
                    .onSubmit {
                        GrpcClient.updateAddress()
                    }
                    .textInputAutocapitalization(.never)
                    .disableAutocorrection(true)
                }
            }
            Spacer()
            Button(role:.destructive) {
                deleteAllDataConfirm1 = true
            }label: {
                Text("Delete Cached Data")
            }.confirmationDialog("Delete Cached Data?", isPresented: $deleteAllDataConfirm1) {
                Button("Delete", role: .destructive) {
                    deleteAllDataConfirm2 = true
                }
            } message: {
                Text("Delete Cached Data?")
            }.confirmationDialog("You cannot undo this operation. Are you sure to delete all cached data?", isPresented: $deleteAllDataConfirm2) {
                Button("Delete all cached date") {
                    Task {
                        store = CardCollection_Ios_IosStoreSchema()
                        BinderDataStore.save(storage: store) { result in
                            if case .failure(let error) = result {
                                fatalError(error.localizedDescription)
                            }
                        }
                    }
                }
                Button("Cancel", role: .destructive) {}
            } message: {
                Text("You cannot undo this operation. Are you sure to delete all cached data?")
            }
        }
    }
}

struct SettingsView_Previews: PreviewProvider {
    static var previews: some View {
        SettingsView(store: .constant(CardCollection_Ios_IosStoreSchema()))
    }
}
