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
            };
        })});
    }).catch(err => {
        callback({code: 2, message: err}, null);
    });
}

function updateBinder(call, callback) {
    db.renameBinder(call.request.id, call.request.new_name).then(() => {
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
    db.moveCardToAnotherBinder(call.request.card_id, call.request.new_binder_id).then(() => {
        callback(null, {});
    }).catch(err => {
        callback({code: 2, message: err}, null);
    });
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
grpc.startServer('0.0.0.0:33333');

const gracefulShutdown = () => {
    db.teardown()
        .catch(() => {})
        .then(() => process.exit());
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown); // Sent by nodemon