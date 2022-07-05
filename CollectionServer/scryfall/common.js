const got = require('got');

function getAllCardsUrl(type) {
    return got.get('https://api.scryfall.com/bulk-data', {responseType: 'json'})
        .then(res => {
            const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
            console.log('Status Code:', res.statusCode);
            console.log('Date in Response header:', headerDate);

            const data = res.body.data.find(bulk_data => bulk_data.type === type);
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

module.exports = {getAllCardsUrl};