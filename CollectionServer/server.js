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
    bulk_data_query.handleAllSets().then(set_count => {
        bulk_data_query.handleAllCards().then(card_count => {
            callback(null, {sets_downloaded: set_count, cards_downloaded: card_count});
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

grpc.bindRpcHandler('updateMetadata', updateMetadata);
grpc.bindRpcHandler('addBinder', addBinder);
grpc.bindRpcHandler('listBinders', listBinders);
grpc.bindRpcHandler('updateBinder', updateBinder);
grpc.bindRpcHandler('deleteBinder', deleteBinder);
grpc.startServer('0.0.0.0:33333');

const gracefulShutdown = () => {
    db.teardown()
        .catch(() => {})
        .then(() => process.exit());
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown); // Sent by nodemon