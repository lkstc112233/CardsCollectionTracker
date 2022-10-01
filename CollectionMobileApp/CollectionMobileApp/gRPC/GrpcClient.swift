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
