//
//  BinderDataStore.swift
//  CollectionMobileApp
//
//  Created by Kevin on 10/2/22.
//

import Foundation
import SwiftUI

class BinderDataStore: ObservableObject {
    @Published var storage = CardCollection_Ios_IosStoreSchema()
    
    private static func fileURL() throws -> URL {
        try FileManager.default.url(for: .documentDirectory,
                                       in: .userDomainMask,
                                       appropriateFor: nil,
                                       create: false)
            .appendingPathComponent("storage.data")
    }
    
    static func load(completion: @escaping (Result<CardCollection_Ios_IosStoreSchema, Error>)->Void) {
        DispatchQueue.global(qos: .background).async {
            do {
                let fileURL = try fileURL()
                guard let file = try? FileHandle(forReadingFrom: fileURL) else {
                    DispatchQueue.main.async {
                        completion(.success(CardCollection_Ios_IosStoreSchema()))
                    }
                    return
                }
                let data = try CardCollection_Ios_IosStoreSchema(serializedData:file.availableData)
                DispatchQueue.main.async {
                    completion(.success(data))
                }
            } catch {
                DispatchQueue.main.async {
                    completion(.failure(error))
                }
            }
        }
    }
    
    static func mergeBinderIntoStorage(storage: inout CardCollection_Ios_IosStoreSchema, binderInfo: CardCollection_Binder, response: CardCollection_Service_ListCardInBinderResponse) {
        if var cached = storage.cachedBinders.first(where: {binder in binder.binderInfo.id == binderInfo.id}) {
            cached.binderInfo = binderInfo
            cached.cardsInBinder = response
        } else {
            var info = CardCollection_Ios_IosStoreSchema.CachedBinders()
            info.binderInfo = binderInfo
            info.cardsInBinder = response
            storage.cachedBinders.append(info)
        }
    }
    
    static func save(storage: CardCollection_Ios_IosStoreSchema, completion: @escaping (Result<Bool, Error>)->Void) {
        DispatchQueue.global(qos: .background).async {
            do {
                let data = try storage.serializedData()
                let outfile = try fileURL()
                try data.write(to: outfile)
                DispatchQueue.main.async {
                    completion(.success(true))
                }
            } catch {
                DispatchQueue.main.async {
                    completion(.failure(error))
                }
            }
        }
    }
}
