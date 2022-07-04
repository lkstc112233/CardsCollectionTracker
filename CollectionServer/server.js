const db = require('./database/mysql');
const grpc = require('./grpc');
const bulk_data_query = require('./scryfall/bulk_data_query');

db.init().then(() => {
    console.log('table created');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});

function updateMetadata(request, callback) {
    bulk_data_query.handleAllCards().then(count => {
        callback(null, {cards_downloaded: count});
    });
}

grpc.bindRpcHandler('updateMetadata', updateMetadata);
grpc.startServer('0.0.0.0:33333');

const gracefulShutdown = () => {
    db.teardown()
        .catch(() => {})
        .then(() => process.exit());
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown); // Sent by nodemon