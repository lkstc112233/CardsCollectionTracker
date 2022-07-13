const collection_service_proto = require('../collection_service_pb');
const {CollectionServicePromiseClient} = require('../collection_service_grpc_web_pb');
const enableDevTools = window.__GRPCWEB_DEVTOOLS__ || (() => {});

var client = new CollectionServicePromiseClient(`http://${window.location.hostname}:8080`);

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
    request.setFrontMatch(false);
    request.setResultLimit(100);
    return client.queryCardInfoByName(request);
}

async function listBinders(query) {
    var request = new collection_service_proto.ListBindersRequest();
    return client.listBinders(request);
}

async function addBinder(name) {
    var request = new collection_service_proto.AddBinderRequest();
    request.setName(name);
    return client.addBinder(request);
}

async function updateMetadata() {
    var request = new collection_service_proto.UpdateMetadataRequest();
    return client.updateMetadata(request);
}

async function deleteBinder(id) {
    var request = new collection_service_proto.DeleteBinderRequest();
    request.setId(id);
    return client.deleteBinder(request);
}

async function moveCardToAnotherBinder(cardId, newBinderId) {
    var request = new collection_service_proto.MoveCardToAnotherBinderRequest();
    request.setCardId(cardId);
    request.setNewBinderId(newBinderId);
    return client.moveCardToAnotherBinder(request);
}

async function deleteCardInCollection(cardId) {
    var request = new collection_service_proto.DeleteCardInCollectionRequest();
    request.setId(cardId);
    return client.deleteCardInCollection(request);
}

module.exports = {
    addCardToCollection,
    listAllBinderCards,
    queryCardInfoByName,
    listBinders,
    addBinder,
    updateMetadata,
    deleteBinder,
    moveCardToAnotherBinder,
    deleteCardInCollection,
};
