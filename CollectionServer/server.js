const db = require('./database/mysql');
const grpc = require('./grpc');
const bulk_data_query = require('./scryfall/bulk_data_query');

db.init().then(() => {
    console.log('table created');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});

function updateMetadata(call, callback) {
    bulk_data_query.handleAllMetadata().then(result => {
        callback(null, {
            sets_downloaded: result.set_count, 
            cards_downloaded: result.cards_count, 
            oracle_downloaded: result.oracle_count
        });
    }).catch(err => {
        callback({code: 2, message: err}, null);
    });
}

function addBinder(call, callback) {
    db.addBinder(call.request.name).then(() => {
        callback(null, {});
    }).catch(err => {
        callback({code: 2, message: err}, null);
    });
}

function listBinders(call, callback) {
    db.queryBinders().then(binders => {
        callback(null, {binders: binders.map(b => {return {
            name: b.binder_name,
            id: b.id,
            card_count: b.card_count,
            type: b.binder_type,
            rent_out_count: b.rent_count,
            };
        })});
    }).catch(err => {
        callback({code: 2, message: err}, null);
    });
}

async function updateBinderInternal(call) {
    var promises = [];
    if (call.request.new_name != '') {
        promises.push(db.renameBinder(call.request.id, call.request.new_name));
    }
    if (call.request.new_binder_id != 0) {
        promises.push(db.changeBinderType(call.request.id, call.request.new_binder_id));
    }
    return Promise.all(promises);
}

function updateBinder(call, callback) {
    updateBinderInternal(call).then(() => {
        callback(null, {});
    }).catch(err => {
        callback({code: 2, message: err}, null);
    });
}

function deleteBinder(call, callback) {
    db.deleteBinder(call.request.id).then(() => {
        callback(null, {});
    }).catch(err => {
        callback({code: 2, message: err}, null);
    });
}

function queryCardInfoByName(call, callback) {
    db.queryCardsInfoByName(
            call.request.query,
            call.request.en_only,
            call.request.front_match,
            call.request.result_limit).then(cards => {
        callback(null, {info: cards.map(card => {return {
                id: card.id,
                name: card.name,
                image_uri: card.image,
                printed_name: card.printed_name,
                language: card.language,
                versions: card.possible_version?.split('|'),
                set_name: card.set_name,
                collectors_id: card.collectors_id,
            };
        })});
    }).catch(err => {
        callback({code: 2, message: err}, null);
    });
}

function addCardToCollection(call, callback) {
    db.addCardToCollection(
            call.request.card_id,
            'version' in call.request? call.request.version : null,
            call.request.binder_id).then(() => {
        callback(null, {});
    }).catch(err => {
        callback({code: 2, message: err}, null);
    });
}

function deleteCardInCollection(call, callback) {
    db.deleteCardInCollection(call.request.id).then(() => {
        callback(null, {});
    }).catch(err => {
        callback({code: 2, message: err}, null);
    });
}

function moveCardToAnotherBinder(call, callback) {
    moveCardToAnotherBinderInternal(call).then(() => {
        callback(null, {});
    }).catch(err => {
        callback({code: 2, message: err}, null);
    });
}

async function moveCardToAnotherBinderInternal(call) {
    switch (call.request.type) {
        case 2:
            return db.rentCardToBinder(call.request.card_id, call.request.new_binder_id);
        case 3:
            return db.returnCardToOriginBinder(call.request.card_id);
        case 1:
        default:
            return db.moveCardToAnotherBinder(call.request.card_id, call.request.new_binder_id);
    }
}

async function listOrCountCardInBinder(binder_id, name_only) {
    if (name_only) {
        return db.countCardsInBinder(binder_id).then(res => {
            return {cards_names: res.reduce((a, v) => ({...a, [v.name]: v.count}), {})};
        });
    }
    return db.listCardInBinder(binder_id).then(res => {
        return {cards:
            res.map(card => {return {
                id: card.id,
                version: card.version,
                binder_id: card.binder_id,
                card_info: {
                    id: card.card_id,
                    name: card.name,
                    image_uri: card.image,
                    printed_name: card.printed_name,
                    language: card.language,
                    set_name: card.set_name,
                    collectors_id: card.collectors_id,
                },
            };
        })};
    });
}

function listCardInBinder(call, callback) {
    listOrCountCardInBinder(call.request.binder_id, call.request.name_only).then(res => {
        callback(null, res);
    }).catch(err => {
        callback({code: 2, message: err}, null);
    });
}

function checkCardCountInCollection(call, callback) {
    var names = call.request.cards_to_check.map(info => info.name).filter(name => name);
    db.countCardsInCollection(names).then(res => {
        var result = res.map(
            v => {
                if (!names.includes(v.name)) {
                    v.name = v.main_name;
                }
                return v;
            }
        ).reduce((a, v) => ({...a, [v.name]: {
            count: v.count,
            status: v.count === 0? 3: 2,
        }}), {});
        result = names.filter(name => !result.hasOwnProperty(name))
        .reduce((a, v) => ({...a, [v]: {
            status: 1,
        }}), result);
        callback(null, {cards_status: result});
    }).catch(err => {
        callback({code: 2, message: err}, null);
    });
}

function addToWishlist(call, callback) {
    db.addAllCardsToGenericWishlist(call.request.wishlist).then(() => {
        callback(null, {});
    }).catch(err => {
        callback({code: 2, message: err}, null);
    });
}

function getWishlistStatus(wishListCount, collectionCount) {
    if (wishListCount === null || wishListCount === 0) {
        return 0;
    }
    if (collectionCount === 0) {
        return 1;
    }
    if (collectionCount < wishListCount) {
        return 2;
    }
    if (collectionCount >= wishListCount) {
        return 3;
    }
    return 0;
}

function listWishlist(call, callback) {
    db.listCardsInGenericWishlist().then(cards => {
        callback(null, {wishlist: cards.map(card => {return {
            count: card.wish_count,
            wished_card: {
                card_info: {
                    name: card.name,
                },
            },
            status: getWishlistStatus(card.wish_count, card.collection_count),
        };
    })});
    }).catch(err => {
        callback({code: 2, message: err}, null);
    });
}

function cleanupFulfilledWishes(call, callback) {
    db.cleanupCardsInGenericWishlist().then(() => {
        callback(null, {});
    }).catch(err => {
        callback({code: 2, message: err}, null);
    });
}

grpc.bindRpcHandler('updateMetadata', updateMetadata);
grpc.bindRpcHandler('addBinder', addBinder);
grpc.bindRpcHandler('listBinders', listBinders);
grpc.bindRpcHandler('updateBinder', updateBinder);
grpc.bindRpcHandler('deleteBinder', deleteBinder);
grpc.bindRpcHandler('queryCardInfoByName', queryCardInfoByName);
grpc.bindRpcHandler('addCardToCollection', addCardToCollection);
grpc.bindRpcHandler('deleteCardInCollection', deleteCardInCollection);
grpc.bindRpcHandler('moveCardToAnotherBinder', moveCardToAnotherBinder);
grpc.bindRpcHandler('listCardInBinder', listCardInBinder);
grpc.bindRpcHandler('checkCardCountInCollection', checkCardCountInCollection);
grpc.bindRpcHandler('addToWishlist', addToWishlist);
grpc.bindRpcHandler('listWishlist', listWishlist);
grpc.bindRpcHandler('cleanupFulfilledWishes', cleanupFulfilledWishes);
grpc.startServer('0.0.0.0:33333');

const gracefulShutdown = () => {
    db.teardown()
        .catch(() => {})
        .then(() => process.exit());
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown); // Sent by nodemon