const got = require('got');
const { parser } = require('stream-json/Parser');
const { streamArray } = require('stream-json/streamers/StreamArray')

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
                ++objectCounter
            }
        });
        pipeline.on('end', () => {
            console.log(`Found ${objectCounter} objects.`);
            resolve(objectCounter);
        });
    });
}
