const got = require("got");

function getAllCardsUrl() {
    got.get('https://api.scryfall.com/bulk-data', {responseType: 'json'})
        .then(res => {
            const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
            console.log('Status Code:', res.statusCode);
            console.log('Date in Response header:', headerDate);

            const dataList = res.body.data;
            console.log('Got dataList');
            for (bulk_data of dataList) {
                if (bulk_data.type === 'all_cards') {
                    console.log('All cards data url: ' + bulk_data.download_uri);
                }
            }
            console.log('Finished processing dataList');
        })
        .catch(err => {
            console.log('Scryfall api request error: ' + err.message);
        });
}
