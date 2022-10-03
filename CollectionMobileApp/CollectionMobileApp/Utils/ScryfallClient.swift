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
    var versions: [String]
}

fileprivate struct DecodeScryfallCardInfo {
    
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
        
        print("Data received:")
        print(String(decoding: data, as: UTF8.self))
        
        return []
    }
}

