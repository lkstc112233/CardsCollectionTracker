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

const INSERT_INTO_OR_UPDATE_METADATA_TABLE_QUERY = `INSERT INTO
    card_infos(scryfall_id, 
        card_name,
        lang,
        scryfall_api_uri,
        scryfall_card_url,
        card_printed_name,
        scryfall_image_uri,
        version,
        reference_usd_cent_price
    )
    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
    scryfall_id=VALUES(scryfall_id),
    card_name=VALUES(card_name),
    lang=VALUES(lang),
    scryfall_api_uri=VALUES(scryfall_api_uri),
    scryfall_card_url=VALUES(scryfall_card_url),
    card_printed_name = VALUES(card_printed_name),
    scryfall_image_uri = VALUES(scryfall_image_uri),
    version = VALUES(version),
    reference_usd_cent_price = VALUES(reference_usd_cent_price)`;

// valid args: card_printed_name, scryfall_image_uri, version_string, reference_usd_cent_price
function formCardMetadataQueryValues(id, card_name, language, scryfall_api_uri, scryfall_card_url, args) {
    var values = [
        id,
        card_name,
        language,
        scryfall_api_uri,
        scryfall_card_url,
    ];
    if ('card_printed_name' in args) {
        values.push(args.card_printed_name);
    } else {
        values.push(null);
    }
    if ('scryfall_image_uri' in args) {
        values.push(args.scryfall_image_uri);
    } else {
        values.push(null);
    }
    if ('version_string' in args) {
        values.push(args.version_string);
    } else {
        values.push(null);
    }
    if ('reference_usd_cent_price' in args) {
        values.push(args.reference_usd_cent_price);
    } else {
        values.push(null);
    }
    return values;
}

module.exports = {
    CREATE_TABLES,
    INSERT_INTO_OR_UPDATE_METADATA_TABLE_QUERY,
    formCardMetadataQueryValues,
};