const TABLE_DEFINITIONS = [
    {
        'NAME': 'set_infos',
        'COLUMNS': [
            ['scryfall_id', 'VARCHAR(36)'],
            ['set_name', 'VARCHAR(255)'],
            ['set_code', 'VARCHAR(10)'],
            ['scryfall_api_uri', 'VARCHAR(70)'],
            ['scryfall_image_uri', 'VARCHAR(1000)'],
        ],
        'PRIMARY_KEY': 'scryfall_id',
        'UNIQUE_INDEX': 'scryfall_id',
    },
    {
        'NAME': 'card_oracle_infos',
        'COLUMNS': [
            ['scryfall_id', 'VARCHAR(36)'],
            ['card_oracle_name', 'VARCHAR(255)'],
            ['constructed', 'TINYINT(1)'],
        ],
        'PRIMARY_KEY': 'scryfall_id',
        'UNIQUE_INDEX': 'scryfall_id',
    },
    {
        'NAME': 'card_infos',
        'COLUMNS': [
            ['scryfall_id', 'VARCHAR(36)'],
            ['card_name', 'VARCHAR(255)'],
            ['oracle_id', 'VARCHAR(36)'],
            ['card_printed_name', 'VARCHAR(255)'],
            ['lang', 'VARCHAR(10)'],
            ['scryfall_api_uri', 'VARCHAR(70)'],
            ['scryfall_card_url', 'VARCHAR(1000)'],
            ['scryfall_image_uri', 'VARCHAR(1000)'],
            ['version', 'VARCHAR(50)'],
            ['set_id', 'VARCHAR(36)'],
            ['reference_usd_cent_price', 'INT'],
            ['collectors_id', 'VARCHAR(10)'],
        ],
        'PRIMARY_KEY': 'scryfall_id',
        'UNIQUE_INDEX': 'scryfall_id',
        'FOREIGN_KEY': [
            ['set_id', 'set_infos(scryfall_id)'],
            ['oracle_id', 'card_oracle_infos(scryfall_id)'],
        ],
    },
    {
        'NAME': 'binder_infos',
        'COLUMNS': [
            ['id', 'INT AUTO_INCREMENT'],
            ['binder_name', 'VARCHAR(255)'],
        ],
        'PRIMARY_KEY': 'id',
    },
    {
        'NAME': 'cards_collection',
        'COLUMNS': [
            ['id', 'INT AUTO_INCREMENT'],
            ['card_id', 'VARCHAR(36)'],
            ['version', 'VARCHAR(10)'],
            ['binder_id', 'INT'],
        ],
        'PRIMARY_KEY': 'id',
        'FOREIGN_KEY': [
            ['card_id', 'card_infos(scryfall_id)'],
            ['binder_id', 'binder_infos(id)'],
        ],
    },
]

// No user input, it's safe to construct the query.
const CREATE_TABLES = `${
    TABLE_DEFINITIONS.map(
        table => `
        CREATE TABLE IF NOT EXISTS ${table.NAME} (
            ${table.COLUMNS.map(col => col.join(' ')).join(',')}
            ${'PRIMARY_KEY' in table? `, PRIMARY KEY(${table.PRIMARY_KEY})`: ''}
            ${'UNIQUE_INDEX' in table? `, UNIQUE INDEX(${table.PRIMARY_KEY})`: ''}
            ${'FOREIGN_KEY' in table? `, ${table.FOREIGN_KEY.map(col => 
                `FOREIGN KEY (${col[0]}) REFERENCES ${col[1]}`).join(',')}`: ''}
        ) DEFAULT CHARSET utf8mb4;
        `
    ).join('')
}
ALTER TABLE binder_infos AUTO_INCREMENT = 10;
INSERT INTO
binder_infos(id, binder_name)
VALUES(1, 'Unbinded')
ON DUPLICATE KEY UPDATE
binder_name=VALUES(binder_name);
`;

const QUERY_TABLE_COLUMNS = `
    SELECT TABLE_NAME AS t, COLUMN_NAME AS c
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA="card_collection"`;

// No user input allowed!
function buildAddColumnQuery(existing) {
    return TABLE_DEFINITIONS
        .map(table => {return {
            "table": table.NAME,
            "columns": table.COLUMNS.filter(
                col => !existing.some(row => row.t === table.NAME && row.c === col[0])
            ),
        }})
        .filter(table => table.columns.length !== 0)
        .map(table => `
            ALTER TABLE ${table.table}
            ${table.columns.map(col => `ADD COLUMN ${col.join(' ')}`).join(',')};`)
        .join('');
}

const INSERT_INTO_BINDERS_QUERY = `INSERT INTO binder_infos(binder_name) VALUES(?)`;
const GET_BINDERS_QUERY = `
    SELECT binder_infos.*, count(cards_collection.id) AS card_count 
    FROM binder_infos
    LEFT JOIN cards_collection ON binder_infos.id = cards_collection.binder_id
    GROUP BY binder_infos.id
`;
const RENAME_BINDER_QUERY = `UPDATE binder_infos SET binder_name = ? WHERE id = ?`;

const DELETE_BINDERS_QUERY = `
UPDATE cards_collection SET binder_id = 1 WHERE binder_id = ?;
DELETE FROM binder_infos WHERE id = ?;
`;

function buildQueryCardInfoByName(en_only, front_match, limit) {
    return `SELECT 
        card_infos.scryfall_id AS id,
        card_infos.card_name AS name,
        card_infos.scryfall_image_uri AS image,
        card_infos.card_printed_name AS printed_name,
        card_infos.lang AS language,
        card_infos.version AS possible_version,
        set_infos.set_name AS set_name
    FROM card_infos
    JOIN card_oracle_infos ON card_infos.oracle_id = card_oracle_infos.scryfall_id
    JOIN set_infos ON card_infos.set_id = set_infos.scryfall_id
    WHERE card_oracle_infos.constructed = 1
        ${en_only?"AND card_infos.lang = 'en'":''}
        AND UPPER(card_oracle_infos.card_oracle_name) LIKE concat(${front_match? "'%', ": ''}UPPER(?), '%')
    ${limit? 'LIMIT ' + limit: ''}
    `;
}

const ADD_CARD_TO_COLLECTION_QUERY = `INSERT INTO cards_collection(card_id, version, binder_id) VALUES(?, ?, ?)`;
const DELETE_CARD_IN_COLLECTION_QUERY = `DELETE FROM cards_collection WHERE id = ?`;
const MOVE_CARD_TO_ANOTHER_BINDER_QUERY = `UPDATE cards_collection SET binder_id = ? WHERE id = ?`;

function buildListCardsInBinderQuery(all_binders) {
    return `
    SELECT
        cards_collection.id AS id,
        cards_collection.version AS version,
        cards_collection.binder_id AS binder_id,
        card_infos.scryfall_id AS card_id,
        card_infos.card_name AS name,
        card_infos.scryfall_image_uri AS image,
        card_infos.card_printed_name AS printed_name,
        card_infos.lang AS language,
        set_infos.set_name AS set_name
    FROM cards_collection
    JOIN card_infos ON cards_collection.card_id = card_infos.scryfall_id
    JOIN set_infos ON card_infos.set_id = set_infos.scryfall_id
    ${all_binders? '': 'WHERE cards_collection.binder_id = ?'}
    `;
}

function buildCountCardsInBinderQuery(all_binders) {
    return `
    SELECT
        card_oracle_infos.card_oracle_name AS name,
        COUNT(*) AS count
    FROM cards_collection
    JOIN card_infos ON cards_collection.card_id = card_infos.scryfall_id
    JOIN card_oracle_infos ON card_infos.oracle_id = card_oracle_infos.scryfall_id
    ${all_binders? '': 'WHERE cards_collection.binder_id = ?'}
    GROUP BY card_infos.oracle_id
    `;
}

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
        reference_usd_cent_price,
        collectors_id
    )
    VALUES${new Array(count).fill('(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ')}
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
    reference_usd_cent_price = VALUES(reference_usd_cent_price),
    collectors_id = VALUES(collectors_id)`;
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
    if ('collectors_id' in args) {
        values.push(args.collectors_id);
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
    QUERY_TABLE_COLUMNS,
    INSERT_INTO_BINDERS_QUERY,
    GET_BINDERS_QUERY,
    RENAME_BINDER_QUERY,
    DELETE_BINDERS_QUERY,
    ADD_CARD_TO_COLLECTION_QUERY,
    DELETE_CARD_IN_COLLECTION_QUERY,
    MOVE_CARD_TO_ANOTHER_BINDER_QUERY,
    buildAddColumnQuery,
    buildQueryCardInfoByName,
    buildListCardsInBinderQuery,
    buildCountCardsInBinderQuery,
    buildInsertOrUpdateCardMetadataTableQuery,
    buildInsertOrUpdateSetMetadataTableQuery,
    buildInsertOrUpdateOracleMetadataTableQuery,
    formCardMetadataQueryValues,
    formCardMetadataQueryValuesFromCardObject,
};