//
//  AddCardView.swift
//  CollectionMobileApp
//
//  Created by Kevin on 10/1/22.
//

import SwiftUI

struct AddCardView: View {
    var id: Int32
    @State private var cards = [IdentifiableWrapper<CardCollection_CardInfo, String>]()
    @State private var searchText = ""
    
    var body: some View {
        NavigationView {
            List(cards) { card in
                HStack{
                    Text(card.value.name)
                    if card.value.collectorsID != "" {
                        Text(" (\(card.value.collectorsID))")
                            .foregroundColor(.secondary)
                    }
                    Spacer()
                    Text(card.value.setName)
                        .foregroundColor(.secondary)
                }
                .contextMenu(menuItems: {
                    Button{} label: {
                        Button {
                        }label: {
                            Label("Placeholder", systemImage: "timelapse")
                        }
                    }
                }, preview: {
                    AsyncImage(url: URL(string: card.value.imageUri)){ phase in
                        if let image = phase.image {
                            image.resizable()
                        } else if phase.error != nil {
                            Color.red
                        } else {
                            ProgressView()
                        }
                    }
                })
            }
            .searchable(text: $searchText, prompt: "Card Name")
            .disableAutocorrection(true)
            .navigationTitle("Add Card")
            .navigationBarTitleDisplayMode(.inline)
        }
        .onSubmit(of: .search, runSearch)
    }

    func runSearch() {
        Task {
            do {
                cards = try await GrpcClient.queryCardInfoByName(name: searchText).map({info in wrapIdentifiable(value: info, getId: {i in i.id})})
                print("Found \(cards.count) cards.")
            } catch {
                cards = []
                print("Error happened loading cards to add: " + error.localizedDescription)
            }
        }
    }
}

struct AddCardView_Previews: PreviewProvider {
    static var previews: some View {
        AddCardView(id:0)
    }
}
