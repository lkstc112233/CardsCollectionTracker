const { escape } = require('mysql');

const CREATE_TABLES = `CREATE TABLE IF NOT EXISTS card_infos (
    scryfall_id VARCHAR(36),
    card_name VARCHAR(255),
    card_printed_name VARCHAR(255),
    lang VARCHAR(10),
    scryfall_api_uri VARCHAR(70),
    scryfall_card_url VARCHAR(1000),
    scryfall_image_uri VARCHAR(1000),
    version VARCHAR(50),
    reference_usd_cent_price INT,
    PRIMARY KEY(scryfall_id),
    UNIQUE INDEX(scryfall_id)
) DEFAULT CHARSET utf8mb4`;

// valid args: card_printed_name, scryfall_image_uri, version_string, reference_usd_cent_price
function buildCardMetadataQuery(id, card_name, language, scryfall_api_uri, scryfall_card_url, args) {
    var keys = ['scryfall_id', 'card_name', 'lang', 'scryfall_api_uri', 'scryfall_card_url'];
    var values = [
        escape(id),
        escape(card_name),
        escape(language),
        escape(scryfall_api_uri),
        escape(scryfall_card_url)
    ];
    if ('card_printed_name' in args) {
        keys.push('card_printed_name');
        values.push(escape(args.card_printed_name));
    }
    if ('scryfall_image_uri' in args) {
        keys.push('scryfall_image_uri');
        values.push(escape(args.scryfall_image_uri));
    }
    if ('version_string' in args) {
        keys.push('version');
        values.push(escape(args.version_string));
    }
    if ('reference_usd_cent_price' in args) {
        keys.push('reference_usd_cent_price');
        values.push(escape(args.reference_usd_cent_price));
    }
    var updateArray = values.map((value, index) => (keys[index] + '=' + value));
    return `INSERT INTO
    card_infos(${keys.join(', ')})
    VALUES(${values.join(', ')})
    ON DUPLICATE KEY UPDATE ${updateArray.join(', ')}`;
}

module.exports = {
    CREATE_TABLES,
    buildCardMetadataQuery,
};