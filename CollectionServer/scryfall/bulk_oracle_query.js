const got = require('got');
const { parser } = require('stream-json/Parser');
const { streamArray } = require('stream-json/streamers/StreamArray')
const db = require('../database/mysql');
const scryfall_common = require('./common');

async function handleAllOracle(batch_size) {
    var bulk_data_url = await scryfall_common.getAllCardsUrl('oracle_cards');
    const pipeline = got.stream(bulk_data_url).pipe(parser()).pipe(streamArray());
    return new Promise(function(resolve, reject) {
        var objectCounter = 0;
        var oracleList = [];
        pipeline.on('data', data => {
            if (data.value?.object === 'card') {
                ++objectCounter;
                oracleList.push(buildOracleObject(data.value));
                if (oracleList.length >= batch_size) {
                    db.updateOracleObjectsMetadata(oracleList).catch(err => {
                        console.log('Error happened while handling all oracle: ' + 
                        err.message + 
                        ', handling oracle list ' + 
                        oracleList.map(obj => obj.name).join(', '));
                    });
                    oracleList = [];
                }
            }
        });
        pipeline.on('end', () => {
            console.log(`Found ${objectCounter} objects.`);
            if (oracleList.length > 0) {
                db.updateOracleObjectsMetadata(oracleList).catch(err => {
                    console.log('Error happened while handling all oracle: ' + 
                    err.message + 
                    ', handling oracle list ' + 
                    oracleList.map(obj => obj.name).join(', '));
                });
                oracleList = [];
            }
            resolve(objectCounter);
        });
    });
}

function buildOracleObject(cardData) {
    let constructed = false;
    if ('legalities' in cardData) {
        constructed = Object.values(cardData.legalities).some((leg) => leg !== 'not_legal');
    }
    return {
        'id': cardData.oracle_id,
        'name': cardData.name,
        'is_constructed': constructed,
    };
}

module.exports = {handleAllOracle};