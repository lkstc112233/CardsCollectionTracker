const collection_service_proto = require('../collection_service_pb');
const {CollectionServicePromiseClient} = require('../collection_service_grpc_web_pb');
const enableDevTools = window.__GRPCWEB_DEVTOOLS__ || (() => {});

var client = new CollectionServicePromiseClient('http://localhost:8080');

enableDevTools([
  client,
]);

async function addCardToCollection(card_id, version, binder_id) {
    var request = new collection_service_proto.AddCardToCollectionRequest();
    request.setCardId(card_id);
    if (version !== undefined && version !== null) {
        request.setVersion(version);
    }
    if (binder_id !== undefined && binder_id !== null) {
        request.setBinderId(binder_id);
    }
    return client.addCardToCollection(request);
}

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

async function listBinders(query) {
    var request = new collection_service_proto.ListBindersRequest();
    return client.listBinders(request);
}

module.exports = {
    addCardToCollection,
    listAllBinderCards,
    queryCardInfoByName,
    listBinders,
};
