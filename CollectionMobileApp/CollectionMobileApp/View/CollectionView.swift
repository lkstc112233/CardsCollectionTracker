//
//  CollectionView.swift
//  CollectionMobileApp
//
//  Created by Kevin on 9/27/22.
//

import SwiftUI

struct CollectionView: View {
    var body: some View {
        NavigationView {
            List {
                NavigationLink{
                    BinderView(name: "Unbinded")
                }label: {
                    Text("Unbinded")
                }
                NavigationLink{
                    BinderView(name: "Example Binder")
                }label: {
                    Text("Trading")
                }
            }
            .navigationTitle("Collections")
            .refreshable {
                // gRPC
            }
        }
    }
}

struct CollectionView_Previews: PreviewProvider {
    static var previews: some View {
        CollectionView()
    }
}
