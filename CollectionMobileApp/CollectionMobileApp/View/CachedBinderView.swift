//
//  CachedBinderView.swift
//  CollectionMobileApp
//
//  Created by Kevin on 9/27/22.
//

import SwiftUI

struct CachedBinderView: View {
    var name: String
    
    var body: some View {
        List {
            Text("Example Card 1")
                .contextMenu {
                    Button {
                    }label: {
                        Label("Delete from collection", systemImage: "minus.circle")
                    }
                }
            Text("Example Card 2")
                .contextMenu {
                    Button {
                    }label: {
                        Label("Delete from collection", systemImage: "minus.circle")
                    }
                }
            Text("Example Card 3")
                .contextMenu {
                    Button {
                    }label: {
                        Label("Delete from collection", systemImage: "minus.circle")
                    }
                }
            Text("Example Card 4")
                .contextMenu {
                    Button {
                    }label: {
                        Label("Delete from collection", systemImage: "minus.circle")
                    }
                }
        }
        .navigationTitle(name)
        .toolbar{
            Button{} label: {
                Label("Sync", systemImage: "arrow.triangle.2.circlepath.circle")
            }
            Button{} label: {
                Label("Decache", systemImage: "archivebox")
            }
        }
        .refreshable {
            // gRPC
        }
    }
}

struct CachedBinderView_Previews: PreviewProvider {
    static var previews: some View {
        CachedBinderView(name: "Example")
    }
}
