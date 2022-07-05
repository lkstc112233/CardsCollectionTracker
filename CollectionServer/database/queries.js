const CREATE_TABLES = `CREATE TABLE IF NOT EXISTS set_infos (
    scryfall_id VARCHAR(36),
    set_name VARCHAR(255),
    set_code VARCHAR(10),
    scryfall_api_uri VARCHAR(70),
    scryfall_image_uri VARCHAR(1000),
    PRIMARY KEY(scryfall_id),
    UNIQUE INDEX(scryfall_id)
) DEFAULT CHARSET utf8mb4;
CREATE TABLE IF NOT EXISTS card_oracle_infos (
    scryfall_id VARCHAR(36),
    card_oracle_name VARCHAR(255),
    constructed TINYINT(1),
    PRIMARY KEY(scryfall_id),
    UNIQUE INDEX(scryfall_id)
) DEFAULT CHARSET utf8mb4;
CREATE TABLE IF NOT EXISTS card_infos (
    scryfall_id VARCHAR(36),
    card_name VARCHAR(255),
    oracle_id VARCHAR(36),
    card_printed_name VARCHAR(255),
    lang VARCHAR(10),
    scryfall_api_uri VARCHAR(70),
    scryfall_card_url VARCHAR(1000),
    scryfall_image_uri VARCHAR(1000),
    version VARCHAR(50),
    set_id VARCHAR(36),
    reference_usd_cent_price INT,
    PRIMARY KEY(scryfall_id),
    UNIQUE INDEX(scryfall_id),
    FOREIGN KEY (set_id) REFERENCES set_infos(scryfall_id),
    FOREIGN KEY (oracle_id) REFERENCES card_oracle_infos(scryfall_id)
) DEFAULT CHARSET utf8mb4;
CREATE TABLE IF NOT EXISTS binder_infos (
    id INT AUTO_INCREMENT,
    binder_name VARCHAR(255),
    PRIMARY KEY(id)
) DEFAULT CHARSET utf8mb4;
CREATE TABLE IF NOT EXISTS cards_collection (
    id INT AUTO_INCREMENT,
    card_id VARCHAR(36),
    version VARCHAR(10),
    binder_id INT,
    PRIMARY KEY(id),
    FOREIGN KEY (card_id) REFERENCES card_infos(scryfall_id),
    FOREIGN KEY (binder_id) REFERENCES binder_infos(id)
) DEFAULT CHARSET utf8mb4;`;

const INSERT_INTO_BINDERS_QUERY = `INSERT INTO binder_infos(binder_name) VALUES(?)`;
const GET_BINDERS_QUERY = `SELECT * FROM binder_infos`;
const RENAME_BINDER_QUERY = `UPDATE binder_infos SET binder_name = ? WHERE id = ?`;
const DELETE_BINDERS_QUERY = `DELETE FROM binder_infos WHERE id = ?`;

const ADD_CARD_TO_COLLECTION_QUERY = `INSERT INTO cards_collection(card_id, version, binder_id) VALUES(?, ?, ?)`;
const DELETE_CARD_IN_COLLECTION_QUERY = `DELETE FROM cards_collection WHERE id = ?`;
const MOVE_CARD_TO_ANOTHER_BINDER_QUERY = `UPDATE cards_collection SET binder_id = ? WHERE id = ?`;

function buildInsertOrUpdateCardMetadataTableQuery(count) {
    return `INSERT INTO
    card_infos(
        scryfall_id, 
        card_name,
        lang,
        set_id,
        oracle_id,
        scryfall_api_uri,
        scryfall_card_url,
        card_printed_name,
        scryfall_image_uri,
        version,
        reference_usd_cent_price
    )
    VALUES${new Array(count).fill('(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ')}
    ON DUPLICATE KEY UPDATE
    scryfall_id=VALUES(scryfall_id),
    card_name=VALUES(card_name),
    lang=VALUES(lang),
    set_id=VALUES(set_id),
    oracle_id=VALUES(oracle_id),
    scryfall_api_uri=VALUES(scryfall_api_uri),
    scryfall_card_url=VALUES(scryfall_card_url),
    card_printed_name = VALUES(card_printed_name),
    scryfall_image_uri = VALUES(scryfall_image_uri),
    version = VALUES(version),
    reference_usd_cent_price = VALUES(reference_usd_cent_price)`;
}

// valid args: card_printed_name, scryfall_image_uri, version_string, reference_usd_cent_price
function formCardMetadataQueryValues(
        id, 
        card_name, 
        language, 
        scryfall_api_uri, 
        scryfall_card_url, 
        set_id, 
        oracle_id, 
        args) {
    var values = [
        id,
        card_name,
        language,
        set_id,
        oracle_id,
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

function formCardMetadataQueryValuesFromCardObject(card) {
    return formCardMetadataQueryValues(
        card.id, 
        card.card_name, 
        card.language,
        card.scryfall_api_uri, 
        card.scryfall_card_url,
        card.set_id,
        card.oracle_id,
        card.args
    );
}

function buildInsertOrUpdateSetMetadataTableQuery(count) {
    return `INSERT INTO
    set_infos(
        scryfall_id, 
        set_name,
        set_code,
        scryfall_api_uri,
        scryfall_image_uri
    )
    VALUES${new Array(count).fill('(?, ?, ?, ?, ?)').join(', ')}
    ON DUPLICATE KEY UPDATE
    set_name=VALUES(set_name),
    set_code=VALUES(set_code),
    scryfall_api_uri=VALUES(scryfall_api_uri),
    scryfall_image_uri = VALUES(scryfall_image_uri)`;
}

function buildInsertOrUpdateOracleMetadataTableQuery(count) {
    return `INSERT INTO
    card_oracle_infos(
        scryfall_id, 
        card_oracle_name,
        constructed
    )
    VALUES${new Array(count).fill('(?, ?, ?)').join(', ')}
    ON DUPLICATE KEY UPDATE
    card_oracle_name=VALUES(card_oracle_name),
    constructed=VALUES(constructed)`;
}

module.exports = {
    CREATE_TABLES,
    INSERT_INTO_BINDERS_QUERY,
    GET_BINDERS_QUERY,
    RENAME_BINDER_QUERY,
    DELETE_BINDERS_QUERY,
    buildInsertOrUpdateCardMetadataTableQuery,
    buildInsertOrUpdateSetMetadataTableQuery,
    buildInsertOrUpdateOracleMetadataTableQuery,
    formCardMetadataQueryValues,
    formCardMetadataQueryValuesFromCardObject,
};