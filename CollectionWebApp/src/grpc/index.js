const collection_service_proto = require('../collection_service_pb');
const {CollectionServicePromiseClient} = require('../collection_service_grpc_web_pb');
const enableDevTools = window.__GRPCWEB_DEVTOOLS__ || (() => {});

var client = new CollectionServicePromiseClient('http://localhost:8080');

enableDevTools([
  client,
]);

async function listAllBinderCards() {
    var request = new collection_service_proto.ListCardInBinderRequest();
    request.setBinderId(0);
    return client.listCardInBinder(request);
}

module.exports = {
    listAllBinderCards,
};
