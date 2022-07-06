const grpc = require('./grpc');

function bindFakeHandler(name, response) {
    grpc.bindRpcHandler(name, function (call, callback) {
        console.log(`#${name} Request: ` + JSON.stringify(call.request, null, 4));
        console.log(`#${name} Response: ` + JSON.stringify(response, null, 4));
        callback(null, response);
    });
}

bindFakeHandler('updateMetadata', {
    sets_downloaded: 0,
    cards_downloaded: 0,
    oracle_downloaded: 0
});
bindFakeHandler('addBinder', {});
bindFakeHandler('listBinders', { binders: [] });
bindFakeHandler('updateBinder', {});
bindFakeHandler('deleteBinder', {});
bindFakeHandler('queryCardInfoByName', {
    info: [{
        id: '00000000-0000-0000-0000-000000000000',
        name: 'test',
        image_uri: 'https://via.placeholder.com/300.png',
        printed_name: 'print test',
        language: 'en',
        versions: 'nonfoil|foil',
    }]
});
bindFakeHandler('addCardToCollection', {});
bindFakeHandler('deleteCardInCollection', {});
bindFakeHandler('moveCardToAnotherBinder', {});
bindFakeHandler('listCardInBinder', {
    cards_names: { 'test': 4 },
    cards:
        [{
            id: 1,
            version: 'foil',
            binder_id: 1,
            card_info: {
                id: '00000000-0000-0000-0000-000000000000',
                name: 'test',
                image_uri: 'https://via.placeholder.com/300.png',
                printed_name: 'print test',
                language: 'en',
            },
        }],
});
grpc.startServer('0.0.0.0:33333');

const gracefulShutdown = () => {
    process.exit();
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown); // Sent by nodemon