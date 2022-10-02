//
//  GrpcClient.swift
//  CollectionMobileApp
//
//  Created by Kevin on 9/30/22.
//

import Foundation
import GRPC
import NIO

var GrpcClient = GrpcClientClass()

enum GrpcError: Error {
    case channelNotReady
}

struct CardToAdd {
    var id: String
    var version: String?
}

class GrpcClientClass {
    private var client: CardCollection_Service_CollectionServiceAsyncClient! = nil
    private var channel: ClientConnection! = nil
    
    private func channelReadyOrIdle() -> Bool {
        return channel.connectivity.state == ConnectivityState.ready
        || channel.connectivity.state == ConnectivityState.idle
    }
    
    func updateAddress() {
        channel = constructChannel()
        client = CardCollection_Service_CollectionServiceAsyncClient(channel: channel)
    }
    
    fileprivate init() {
        channel = constructChannel()
        client = CardCollection_Service_CollectionServiceAsyncClient(channel: channel)
    }
    
    func listBinders() async throws -> [CardCollection_Binder] {
        guard channelReadyOrIdle() else {
            throw GrpcError.channelNotReady
        }
        let request = CardCollection_Service_ListBindersRequest()
        let response = try await client.listBinders(request)
        return response.binders
    }
    
    func listCardsInBinder(id: Int32) async throws -> [CardCollection_Card] {
        guard channelReadyOrIdle() else {
            throw GrpcError.channelNotReady
        }
        var request = CardCollection_Service_ListCardInBinderRequest()
        request.binderID = id
        request.nameOnly = false
        let response = try await client.listCardInBinder(request)
        return response.cards
    }
    
    func queryCardInfoByName(name: String) async throws -> [CardCollection_CardInfo] {
        guard channelReadyOrIdle() else {
            throw GrpcError.channelNotReady
        }
        var request = CardCollection_Service_QueryCardInfoByNameRequest()
        request.query = name
        request.enOnly = true
        request.frontMatch = false
        request.resultLimit = 100
        let response = try await client.queryCardInfoByName(request)
        return response.info
    }
    
    func addCardToCollection(cards: [CardToAdd], binderId: Int32) async throws {
        guard channelReadyOrIdle() else {
            throw GrpcError.channelNotReady
        }
        for card in cards {
            try await addOneCardToCollection(id: card.id, binderId: binderId, version: card.version)
        }
    }
    
    func addOneCardToCollection(id: String, binderId: Int32, version: String?) async throws {
        guard channelReadyOrIdle() else {
            throw GrpcError.channelNotReady
        }
        var request = CardCollection_Service_AddCardToCollectionRequest()
        request.cardID = id
        request.binderID = binderId
        if let v = version {
            request.version = v
        }
        let response = try await client.addCardToCollection(request)
    }
    
    private func constructChannel() -> ClientConnection {
        let serverAddress = (UserDefaults.standard.object(forKey: "ServerAddress") as? String ?? "localhost:33333").components(separatedBy: ":")
        
        let host = serverAddress[0]
        var port = 33333
        if serverAddress.count >= 2 {
            port = Int(serverAddress[1]) ?? 33333
        }
        
        return ClientConnection
            .insecure(group: MultiThreadedEventLoopGroup(numberOfThreads: 1))
            .connect(host: host, port: port)
    }
}
