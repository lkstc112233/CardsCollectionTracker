const CREATE_TABLES = `CREATE TABLE IF NOT EXISTS card_infos (
    scryfall_id VARCHAR(36),
    card_name VARCHAR(255),
    card_printed_name VARCHAR(255),
    lang VARCHAR(10),
    scryfall_api_uri VARCHAR(70),
    scryfall_card_url VARCHAR(255),
    scryfall_image_uri VARCHAR(255),
    version VARCHAR(50),
    reference_usd_cent_price INT,
    PRIMARY KEY(scryfall_id),
    UNIQUE INDEX(scryfall_id)
) DEFAULT CHARSET utf8mb4`;

const INSERT_INTO_OR_UPDATE_METADATA_TABLE_5 = `INSERT INTO
    card_infos(scryfall_id, card_name, lang, scryfall_api_uri, scryfall_card_url)
    VALUES(?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
    scryfall_id=VALUES(scryfall_id),
    card_name=VALUES(card_name),
    lang=VALUES(lang),
    scryfall_api_uri=VALUES(scryfall_api_uri),
    scryfall_card_url=VALUES(scryfall_card_url)`;

const INSERT_INTO_OR_UPDATE_METADATA_TABLE_6 = `INSERT INTO
    card_infos(scryfall_id, card_name, lang, scryfall_api_uri, scryfall_card_url, ??)
    VALUES(?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
    scryfall_id=VALUES(scryfall_id),
    card_name=VALUES(card_name),
    lang=VALUES(lang),
    scryfall_api_uri=VALUES(scryfall_api_uri),
    scryfall_card_url=VALUES(scryfall_card_url),
    ?? = ??`;

const INSERT_INTO_OR_UPDATE_METADATA_TABLE_7 = `INSERT INTO
    card_infos(scryfall_id, card_name, lang, scryfall_api_uri, scryfall_card_url, ??, ??)
    VALUES(?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
    scryfall_id=VALUES(scryfall_id),
    card_name=VALUES(card_name),
    lang=VALUES(lang),
    scryfall_api_uri=VALUES(scryfall_api_uri),
    scryfall_card_url=VALUES(scryfall_card_url),
    ?? = ??,
    ?? = ??`;

const INSERT_INTO_OR_UPDATE_METADATA_TABLE_8 = `INSERT INTO
    card_infos(scryfall_id, card_name, lang, scryfall_api_uri, scryfall_card_url, ??, ??, ??)
    VALUES(?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
    scryfall_id=VALUES(scryfall_id),
    card_name=VALUES(card_name),
    lang=VALUES(lang),
    scryfall_api_uri=VALUES(scryfall_api_uri),
    scryfall_card_url=VALUES(scryfall_card_url),
    ?? = ??,
    ?? = ??,
    ?? = ??`;

const INSERT_INTO_OR_UPDATE_METADATA_TABLE_9 = `INSERT INTO
    card_infos(scryfall_id, card_name, lang, scryfall_api_uri, scryfall_card_url, ??, ??, ??, ??)
    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
    scryfall_id=VALUES(scryfall_id),
    card_name=VALUES(card_name),
    lang=VALUES(lang),
    scryfall_api_uri=VALUES(scryfall_api_uri),
    scryfall_card_url=VALUES(scryfall_card_url),
    ?? = ??,
    ?? = ??,
    ?? = ??,
    ?? = ??`;

const INSERT_INTO_OR_UPDATE_METADATA_TABLE_QUERIES = [
    INSERT_INTO_OR_UPDATE_METADATA_TABLE_5,
    INSERT_INTO_OR_UPDATE_METADATA_TABLE_6,
    INSERT_INTO_OR_UPDATE_METADATA_TABLE_7,
    INSERT_INTO_OR_UPDATE_METADATA_TABLE_8,
    INSERT_INTO_OR_UPDATE_METADATA_TABLE_9,
];

// valid args: card_printed_name, scryfall_image_uri, version_string, reference_usd_cent_price
function selectCardMetadataQuery(args) {
    var additionalValueCount = 0;
    if ('card_printed_name' in args) {
        ++additionalValueCount;
    }
    if ('scryfall_image_uri' in args) {
        ++additionalValueCount;
    }
    if ('version_string' in args) {
        ++additionalValueCount;
    }
    if ('reference_usd_cent_price' in args) {
        ++additionalValueCount;
    }
    return INSERT_INTO_OR_UPDATE_METADATA_TABLE_QUERIES[additionalValueCount];
}

// valid args: card_printed_name, scryfall_image_uri, version_string, reference_usd_cent_price
function formCardMetadataQueryValues(id, card_name, language, scryfall_api_uri, scryfall_card_url, args) {
    var keys = [];
    var values = [
        id,
        card_name,
        language,
        scryfall_api_uri,
        scryfall_card_url,
    ];
    if ('card_printed_name' in args) {
        keys.push('card_printed_name');
        values.push(args.card_printed_name);
    }
    if ('scryfall_image_uri' in args) {
        keys.push('scryfall_image_uri');
        values.push(args.scryfall_image_uri);
    }
    if ('version_string' in args) {
        keys.push('version');
        values.push(args.version_string);
    }
    if ('reference_usd_cent_price' in args) {
        keys.push('reference_usd_cent_price');
        values.push(args.reference_usd_cent_price);
    }
    return keys.concat(values, keys.flatMap(k => [k, k]));
}

module.exports = {
    CREATE_TABLES,
    selectCardMetadataQuery,
    formCardMetadataQueryValues,
};