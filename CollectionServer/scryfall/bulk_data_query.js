const got = require("got");

function getAllCardsUrl() {
    got.get('https://api.scryfall.com/bulk-data', {responseType: 'json'})
        .then(res => {
            const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
            console.log('Status Code:', res.statusCode);
            console.log('Date in Response header:', headerDate);

            const data = res.body.data.find(bulk_data => bulk_data.type === 'all_cards');
            console.log('Got data');
            if (data) {
                console.log('All cards data url: ' + data.download_uri);
            }
            console.log('Finished processing dataList');
        })
        .catch(err => {
            console.log('Scryfall api request error: ' + err.message);
        });
}
