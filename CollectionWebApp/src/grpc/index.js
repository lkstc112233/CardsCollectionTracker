const card_proto = require('../card_pb');
const collection_service_proto = require('../collection_service_pb');
const {CollectionServicePromiseClient} = require('../collection_service_grpc_web_pb');
const enableDevTools = window.__GRPCWEB_DEVTOOLS__ || (() => {});

var client = new CollectionServicePromiseClient(`http://${window.location.hostname}:8888`);

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

async function queryCardInfoByName(query, allLang) {
    var request = new collection_service_proto.QueryCardInfoByNameRequest();
    request.setQuery(query);
    request.setEnOnly(!allLang);
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

async function updateBinder(id, newName, newType) {
    var request = new collection_service_proto.UpdateBinderRequest();
    request.setId(id);
    request.setNewName(newName);
    request.setNewType(newType);
    return client.updateBinder(request);
}

async function updateMetadata() {
    var request = new collection_service_proto.UpdateMetadataRequest();
    var deadline = new Date(Date.now() + 1200 * 1000); // 20 minutes
    return client.updateMetadata(request, {deadline: deadline});
}

async function deleteBinder(id) {
    var request = new collection_service_proto.DeleteBinderRequest();
    request.setId(id);
    return client.deleteBinder(request);
}

async function moveCardToAnotherBinder(cardId, newBinderId, isRenting) {
    var request = new collection_service_proto.MoveCardToAnotherBinderRequest();
    request.setCardId(cardId);
    request.setNewBinderId(newBinderId);
    if (isRenting) {
        request.setType(2);
    } else {
        request.setType(1);
    }
    return client.moveCardToAnotherBinder(request);
}

async function deleteCardInCollection(cardId) {
    var request = new collection_service_proto.DeleteCardInCollectionRequest();
    request.setId(cardId);
    return client.deleteCardInCollection(request);
}

async function addToWishlist(name, count = 1) {
    var cardInfo = new card_proto.CardInfo();
    cardInfo.setName(name);
    var wishedCard = new card_proto.Card();
    wishedCard.setCardInfo(cardInfo);
    var wishlist = new card_proto.WishedCard();
    wishlist.setCount(count);
    wishlist.setWishedCard(wishedCard);
    var request = new collection_service_proto.AddToWishlistRequest();
    request.addWishlist(wishlist);
    return client.addToWishlist(request);
}

async function listWishlist() {
    var request = new collection_service_proto.ListWishlistRequest();
    return client.listWishlist(request);
}

async function cleanupFulfilledWishes() {
    var request = new collection_service_proto.CleanupFulfilledWishesRequest();
    return client.cleanupFulfilledWishes(request);
}

module.exports = {
    addCardToCollection,
    listAllBinderCards,
    queryCardInfoByName,
    listBinders,
    addBinder,
    updateBinder,
    updateMetadata,
    deleteBinder,
    moveCardToAnotherBinder,
    deleteCardInCollection,
    addToWishlist,
    listWishlist,
    cleanupFulfilledWishes,
};
