//
//  CardPreviewImageView.swift
//  CollectionMobileApp
//
//  Created by Kevin on 10/1/22.
//

import SwiftUI

struct CardPreviewImageView: View {
    var url: String
    
    var body: some View {
        AsyncImage(url: URL(string: url)){ phase in
            if let image = phase.image {
                image.resizable()
            } else if phase.error != nil {
                Color.red
            } else {
                ProgressView()
            }
        }
    }
}

struct CardPreviewImageView_Previews: PreviewProvider {
    static var previews: some View {
        CardPreviewImageView(url: "https://via.placeholder.com/150")
    }
}
