const got = require('got');
const { parser } = require('stream-json/Parser');
const Pick = require('stream-json/filters/Pick');
const { streamArray } = require('stream-json/streamers/StreamArray')
const db = require('../database/mysql');
const scryfall_common = require('./common');

async function handleAllCards(batch_size) {
    var bulk_data_url = await scryfall_common.getAllCardsUrl('all_cards');
    const pipeline = got.stream(bulk_data_url).pipe(parser()).pipe(streamArray());
    return new Promise(function(resolve, reject) {
        var objectCounter = 0;
        var cardsList = [];
        pipeline.on('data', data => {
            if (data.value?.object === 'card') {
                ++objectCounter;
                cardsList.push(buildCardObject(data.value));
                if (cardsList.length >= batch_size) {
                    db.updateCardObjectsMetadata(cardsList).catch(err => {
                        console.log('Error happened while handling all cards: ' + err.message);
                    });
                    cardsList = [];
                }
            }
        });
        pipeline.on('end', () => {
            console.log(`Found ${objectCounter} objects.`);
            if (cardsList.length > 0) {
                db.updateCardObjectsMetadata(cardsList).catch(err => {
                    console.log('Error happened while handling all cards: ' + err.message);
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
        'oracle_id': cardData.oracle_id,
        'scryfall_api_uri': cardData.uri,
        'scryfall_card_url': cardData.scryfall_uri,
        'args': optionalArgs,
    };
}

module.exports = {handleAllCards};