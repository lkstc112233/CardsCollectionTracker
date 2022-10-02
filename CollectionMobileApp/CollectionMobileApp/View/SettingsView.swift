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
    
    var body: some View {
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
    }
}

struct SettingsView_Previews: PreviewProvider {
    static var previews: some View {
        SettingsView(store: .constant(CardCollection_Ios_IosStoreSchema()))
    }
}
