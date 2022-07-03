const got = require('got');
const { parser } = require('stream-json/Parser');
const { streamArray } = require('stream-json/streamers/StreamArray')
const db = require('../database/mysql');

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

async function handleAllCards() {
    var bulk_data_url = await getAllCardsUrl();
    const pipeline = got.stream(bulk_data_url).pipe(parser()).pipe(streamArray());
    return new Promise(function(resolve, reject) {
        var objectCounter = 0;
        pipeline.on('data', data => {
            if (data.value?.object === 'card') {
                ++objectCounter;
                updateCard(data.value).catch(err => {
                    console.log('Error happened while handling all cards: ' + 
                    err.message + 
                    ', handling card ' + 
                    data.value.name);
                });
            }
        });
        pipeline.on('end', () => {
            console.log(`Found ${objectCounter} objects.`);
            resolve(objectCounter);
        });
    });
}

async function updateCard(cardData) {
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
    return db.updateCardMetadata(cardData.id, cardData.name, cardData.lang, cardData.uri, cardData.scryfall_uri, optionalArgs);
}

module.exports = {handleAllCards};