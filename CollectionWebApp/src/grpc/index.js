const collection_service_proto = require('../collection_service_pb');
const {CollectionServicePromiseClient} = require('../collection_service_grpc_web_pb');
const enableDevTools = window.__GRPCWEB_DEVTOOLS__ || (() => {});

var client = new CollectionServicePromiseClient('http://localhost:8080');

enableDevTools([
  client,
]);

async function listAllBinderCards(binder = 0) {
    var request = new collection_service_proto.ListCardInBinderRequest();
    request.setBinderId(binder);
    return client.listCardInBinder(request);
}

async function queryCardInfoByName(query) {
    var request = new collection_service_proto.QueryCardInfoByNameRequest();
    request.setQuery(query);
    request.setEnOnly(true);
    request.setFrontMatch(true);
    return client.queryCardInfoByName(request);
}

module.exports = {
    listAllBinderCards,
    queryCardInfoByName,
};
