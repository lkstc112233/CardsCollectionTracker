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
    });
}

function addBinder(call, callback) {
    db.addBinder(call.request.name).then(() => {
        callback(null, {});
    });
}

function listBinders(call, callback) {
    db.queryBinders().then(binders => {
        callback(null, {binders: binders.map(b => {return {name: b.binder_name, id: b.id};})});
    });
}

function updateBinder(call, callback) {
    db.renameBinder(call.request.id, call.request.new_name).then(() => {
        callback(null, {});
    });
}

function deleteBinder(call, callback) {
    db.deleteBinder(call.request.id).then(() => {
        callback(null, {});
    });
}

function queryCardInfoByName(call, callback) {
    db.queryCardsInfoByName(call.request.query, call.request.en_only, call.request.front_match).then(cards => {
        callback(null, {info: cards.map(card => {return {
                id: card.id,
                name: card.name,
                image_uri: card.image,
                printed_name: card.printed_name,
                language: card.language,
                versions: card.possible_version?.split('|'),
            };
        })});
    });
}

function addCardToCollection(call, callback) {
    db.addCardToCollection(
            call.request.card_id,
            'version' in call.request? call.request.version : null,
            call.request.binder_id).then(() => {
        callback(null, {});
    });
}

grpc.bindRpcHandler('updateMetadata', updateMetadata);
grpc.bindRpcHandler('addBinder', addBinder);
grpc.bindRpcHandler('listBinders', listBinders);
grpc.bindRpcHandler('updateBinder', updateBinder);
grpc.bindRpcHandler('deleteBinder', deleteBinder);
grpc.bindRpcHandler('queryCardInfoByName', queryCardInfoByName);
grpc.bindRpcHandler('addCardToCollection', addCardToCollection);
grpc.startServer('0.0.0.0:33333');

const gracefulShutdown = () => {
    db.teardown()
        .catch(() => {})
        .then(() => process.exit());
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown); // Sent by nodemon