//
//  ScryfallUtils.swift
//  CollectionMobileApp
//
//  Created by Kevin on 10/2/22.
//

import Foundation

enum ScryfallError: Error {
    case invalidUrl
}

class ScryfallClient {
    
    private static func generateScryfallCardQueryParams(name: String, allLang: Bool) -> [URLQueryItem] {
        var params : [URLQueryItem] = []
        params.append(URLQueryItem(name: "q", value: name))
        params.append(URLQueryItem(name: "unique", value: "prints"))
        params.append(URLQueryItem(name: "include_variations", value: "true"))
        if allLang {
            params.append(URLQueryItem(name: "include_multilingual", value: "true"))
        }

        return params
    }
    
    static func generateScryfallCardQueryUrl(name: String, allLang: Bool) throws -> URL {
        var builder = URLComponents()
        builder.scheme = "https"
        builder.host = "api.scryfall.com"
        builder.path = "/cards/search"
        builder.queryItems = generateScryfallCardQueryParams(name: name, allLang:allLang)
        
        guard let url = builder.url else {
            throw ScryfallError.invalidUrl
        }
        
        return url
    }
}

