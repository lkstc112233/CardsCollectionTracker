const got = require('got');
const { parser } = require('stream-json/Parser');
const Pick = require('stream-json/filters/Pick');
const { streamArray } = require('stream-json/streamers/StreamArray')
const db = require('../database/mysql');

const DEFAULT_BATCH_SIZE = 1000;

async function handleAllSets(batch_size = DEFAULT_BATCH_SIZE) {
    const pipeline = got.stream('https://api.scryfall.com/sets')
        .pipe(Pick.withParser({filter: 'data'}))
        .pipe(streamArray());
    return new Promise(function(resolve, reject) {
        var objectCounter = 0;
        var setsList = [];
        pipeline.on('data', data => {
            if (data.value?.object === 'set') {
                ++objectCounter;
                setsList.push(buildSetObject(data.value));
                if (setsList.length >= batch_size) {
                    db.updateSetObjectsMetadata(setsList).catch(err => {
                        console.log('Error happened while handling all sets: ' + 
                        err.message + 
                        ', handling set list ' + 
                        setsList.map(set => set.name).join(', '));
                    });
                    setsList = [];
                }
            }
        });
        pipeline.on('end', () => {
            console.log(`Found ${objectCounter} objects.`);
            if (setsList.length > 0) {
                db.updateSetObjectsMetadata(setsList).catch(err => {
                    console.log('Error happened while handling all sets: ' + 
                    err.message + 
                    ', handling set list ' + 
                    setsList.map(set => set.name).join(', '));
                });
                setsList = [];
            }
            resolve(objectCounter);
        });
    });
}

function getAllCardsUrl() {
    return got.get('https://api.scryfall.com/bulk-data', {responseType: 'json'})
        .then(res => {
            const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
            console.log('Status Code:', res.statusCode);
            console.log('Date in Response header:', headerDate);

            const data = res.body.data.find(bulk_data => bulk_data.type === 'all_cards');
            console.log('Got data');
            if (data) {
                return data.download_uri;
            }
            throw 'bulk_data not available at this time.';
        })
        .catch(err => {
            console.log('Scryfall api request error: ' + err.message);
        });
}

async function handleAllCards(batch_size = DEFAULT_BATCH_SIZE) {
    var bulk_data_url = await getAllCardsUrl();
    const pipeline = got.stream(bulk_data_url).pipe(parser()).pipe(streamArray());
    return new Promise(function(resolve, reject) {
        var objectCounter = 0;
        var cardsList = [];
        pipeline.on('data', data => {
            if (data.value?.object === 'card') {
                ++objectCounter;
                cardsList.push(buildCardObject(data.value));
                if (cardsList.length >= batch_size) {
                    updateCards(cardsList).catch(err => {
                        console.log('Error happened while handling all cards: ' + 
                        err.message + 
                        ', handling card list ' + 
                        cardsList.map(cards => cards.card_name).join(', '));
                    });
                    cardsList = [];
                }
            }
        });
        pipeline.on('end', () => {
            console.log(`Found ${objectCounter} objects.`);
            if (cardsList.length > 0) {
                updateCards(cardsList).catch(err => {
                    console.log('Error happened while handling all cards: ' + 
                    err.message + 
                    ', handling card list ' + 
                    cardsList.map(cards => cards.card_name).join(', '));
                });
                cardsList = [];
            }
            resolve(objectCounter);
        });
    });
}

function buildCardObject(cardData) {
    optionalArgs = {}
    if ('printed_name' in cardData) {
        optionalArgs.card_printed_name = cardData.printed_name;
    }
    if ('image_uris' in cardData && 'png' in cardData.image_uris && cardData.image_uris.png) {
        optionalArgs.scryfall_image_uri = cardData.image_uris.png;
    }
    if ('finishes' in cardData && cardData.finishes.length > 1) {
        optionalArgs.version_string = cardData.finishes.join('|');
    }
    if ('prices' in cardData && 'usd' in cardData.prices && cardData.prices.usd) {
        optionalArgs.reference_usd_cent_price = cardData.prices.usd * 100;
    }
    return {
        'id': cardData.id,
        'card_name': cardData.name,
        'language': cardData.lang,
        'set_id': cardData.set_id,
        'scryfall_api_uri': cardData.uri,
        'scryfall_card_url': cardData.scryfall_uri,
        'args': optionalArgs,
    };
}

function buildSetObject(setData) {
    return {
        'id': setData.id,
        'name': setData.name,
        'code': setData.code,
        'uri': setData.uri,
        'icon_svg_uri': setData.icon_svg_uri,
    };
}

async function updateCards(cardList) {
    return db.updateCardObjectsMetadata(cardList);
}

module.exports = {
    handleAllCards,
    handleAllSets,
};