//
//  SettingsView.swift
//  CollectionMobileApp
//
//  Created by Kevin on 9/27/22.
//

import SwiftUI

struct SettingsView: View {
    @State private var server: String = "localhost:33333"
    
    var body: some View {
        Form {
            HStack {
                Text("Collection Server")
                TextField(text: $server, prompt: Text("localhost:33333")) {
                    Text("Collection Server")
                }
                    .onSubmit {
                        // Set
                    }
                    .textInputAutocapitalization(.never)
                    .disableAutocorrection(true)
            }
        }
    }
}

struct SettingsView_Previews: PreviewProvider {
    static var previews: some View {
        SettingsView()
    }
}
