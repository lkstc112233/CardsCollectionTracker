const grpc = require('./grpc');

function bindFakeHandler(rpc_name, response, delayMs) {
    grpc.bindRpcHandler(rpc_name, function (call, callback) {
        console.log(`#${rpc_name} Request: ` + JSON.stringify(call.request, null, 4));
        console.log(`#${rpc_name} Response: ` + JSON.stringify(response, null, 4));
        if (delayMs !== undefined && delayMs > 0) {
            new Promise(resolve => setTimeout(() => resolve(), delayMs))
            .then(() => callback(null, response));
        } else {
            callback(null, response);
        }
    });
}

bindFakeHandler('updateMetadata', {
    sets_downloaded: 0,
    cards_downloaded: 0,
    oracle_downloaded: 0
}, 2000);
bindFakeHandler('addBinder', {});
bindFakeHandler('listBinders', { binders: [{name: 'Unbinded', id: 1}, {name: 'binder 1', id: 10}, ] });
bindFakeHandler('updateBinder', {});
bindFakeHandler('deleteBinder', {});
bindFakeHandler('queryCardInfoByName', {
    info: [{
        id: '00000000-0000-0000-0000-000000000000',
        name: 'test',
        image_uri: 'https://via.placeholder.com/300.png',
        printed_name: 'print test',
        language: 'en',
        versions: ['nonfoil', 'foil'],
    }, {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'test 2',
        image_uri: 'https://via.placeholder.com/300.png',
        printed_name: 'print test 2',
        language: 'en',
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
                id: '00000000-0000-0000-0000-000000000003',
                name: 'test',
                image_uri: 'https://via.placeholder.com/300.png',
                printed_name: 'print test',
                language: 'en',
            },
        }, {
            id: 2,
            binder_id: 1,
            card_info: {
                id: '00000000-0000-0000-0000-000000000005',
                name: 'test 2',
                image_uri: 'https://via.placeholder.com/300.png',
                printed_name: '汉字test',
                language: 'en',
            },
        }, {
            id: 3,
            version: 'nonfoil',
            binder_id: 1,
            card_info: {
                id: '00000000-0000-0000-0000-000000000006',
                name: 'test 3',
                image_uri: 'https://via.placeholder.com/300.png',
                language: 'en',
            },
        }, {
            id: 4,
            version: 'foil',
            binder_id: 1,
            card_info: {
                id: '00000000-0000-0000-0000-000000000009',
                name: 'test 4',
                image_uri: 'https://via.placeholder.com/300.png',
                printed_name: '🎯test',
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