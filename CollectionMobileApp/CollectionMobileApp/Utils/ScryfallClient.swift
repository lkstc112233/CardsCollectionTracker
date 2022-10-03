//
//  ScryfallUtils.swift
//  CollectionMobileApp
//
//  Created by Kevin on 10/2/22.
//

import Foundation

let ScryfallClient = ScryfallClientImpl()

enum ScryfallError: Error {
    case invalidUrl
    case responseError
}

struct ScryfallCard {
    var name: String?
    var scryfallId: String?
    var imageUrl: String?
    var setName: String?
    var collectorId: String?
    var versions: [String] = []
}

fileprivate struct DecodeScryfallCardResponse: Decodable {
    let object: String
    let total_cards: Int32
    let has_more: Bool
    let data: [DecodeScryfallCardInfo]
}

fileprivate struct DecodeScryfallCardInfo: Decodable {
    let object: String
    let id: String
    let name: String
    let image_uris: [String: String]?
    let finishes: [String]
    let collector_number: String?
    let set_name: String
}

class ScryfallClientImpl {
    
    fileprivate init() {}
    
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
    
    func queryCardFromScryfall(name: String, allLang: Bool = false) throws -> [ScryfallCard] {
        var dataReceived: Data?
        var error: Error?
        let sem = DispatchSemaphore.init(value: 0)
        let url = try ScryfallClientImpl.generateScryfallCardQueryUrl(name: name, allLang: allLang)
        URLSession.shared.dataTask(with: url) {
            data, request, errorInRequest in
            defer {
                sem.signal()
            }
            if let e = errorInRequest {
                print("Error -> \(e)")
                error = e
                return
            }
            dataReceived = data
        }.resume()
        sem.wait()
        
        if let e = error {
            throw e
        }
        
        guard let data = dataReceived else {
            throw ScryfallError.responseError
        }
        
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .useDefaultKeys

        let response = try decoder.decode(DecodeScryfallCardResponse.self, from: data)
        
        return response.data.map({info in
            var card = ScryfallCard()
            card.name = info.name
            card.scryfallId = info.id
            card.setName = info.set_name
            card.collectorId = info.collector_number
            card.imageUrl = info.image_uris?["png"]
            card.versions = info.finishes
            return card
        })
    }
}

