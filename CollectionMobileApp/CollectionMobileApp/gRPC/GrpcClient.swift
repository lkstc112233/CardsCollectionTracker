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

class GrpcClientClass {
    var client: CardCollection_Service_CollectionServiceAsyncClient! = nil
    
    func updateAddress() {
        client = CardCollection_Service_CollectionServiceAsyncClient(channel: constructChannel())
    }
    
    fileprivate init() {
        client = CardCollection_Service_CollectionServiceAsyncClient(channel: constructChannel())
    }
    
    private func constructChannel() -> GRPCChannel {
        let serverAddress = UserDefaults.standard.object(forKey: "ServerAddress") as? String ?? "localhost:33333"
        
        return ClientConnection
            .insecure(group: MultiThreadedEventLoopGroup(numberOfThreads: 1))
            .connect(host: serverAddress, port: 33333)
    }
}
