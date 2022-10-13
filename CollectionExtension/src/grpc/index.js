const collection_service_proto = require('../collection_service_pb');
const card_proto = require('../card_pb');
const {CollectionServicePromiseClient} = require('../collection_service_grpc_web_pb');

async function getServiceAddress() {
    return new Promise(acc => {
        chrome.storage.sync.get({
            backendAddress: 'http://localhost:33333'
        }, function(items) {
            acc(items.backendAddress);
        });
    });
}

var client = null;

async function initializeClient() {
    address = await getServiceAddress();
    client = new CollectionServicePromiseClient(address);
}

async function ensureClientInitialized() {
    if (client === null) {
        return initializeClient();
    }
    return Promise.resolve();
}

async function checkCardCountInCollection(names) {
    await ensureClientInitialized();
    var request = new collection_service_proto.CheckCardCountInCollectionRequest();
    request.setCardsToCheckList(names.map(name => {
        var info = new card_proto.CardInfo();
        info.setName(name);
        return info;
    }));
    return client.checkCardCountInCollection(request);
}

function buildWishcard(name, count) {
    var cardInfo = new card_proto.CardInfo();
    cardInfo.setName(name);
    var wishedCard = new card_proto.Card();
    wishedCard.setCardInfo(cardInfo);
    var wishcard = new card_proto.WishedCard();
    wishcard.setCount(count);
    wishcard.setWishedCard(wishedCard);
    return wishcard;
}

async function addToWishlist(cardList) {
    await ensureClientInitialized();
    var request = new collection_service_proto.AddToWishlistRequest();
    cardList.map(card => buildWishcard(card.name, card.count))
        .forEach(wish => request.addWishlist(wish));
    return client.addToWishlist(request);
}

module.exports = {
    checkCardCountInCollection,
    addToWishlist,
};
