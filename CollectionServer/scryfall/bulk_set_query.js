const got = require('got');
const { parser } = require('stream-json/Parser');
const Pick = require('stream-json/filters/Pick');
const { streamArray } = require('stream-json/streamers/StreamArray')
const db = require('../database/mysql');

async function handleAllSets(batch_size) {
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

function buildSetObject(setData) {
    return {
        'id': setData.id,
        'name': setData.name,
        'code': setData.code,
        'uri': setData.uri,
        'icon_svg_uri': setData.icon_svg_uri,
    };
}

module.exports = {handleAllSets};