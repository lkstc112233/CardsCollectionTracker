const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = __dirname + '/../proto/collection_service.proto';

const packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });
const service_proto = grpc.loadPackageDefinition(packageDefinition).card_collection.service;
const handlers = {};

function bindRpcHandler(name, handler) {
    handlers[name] = handler;
}

function startServer(address) {
    var server = new grpc.Server();
    server.addService(service_proto.CollectionService.service, handlers);
    server.bindAsync(address, grpc.ServerCredentials.createInsecure(), () => {
        server.start();
    });
}

module.exports = {
    bindRpcHandler,
    startServer,
}