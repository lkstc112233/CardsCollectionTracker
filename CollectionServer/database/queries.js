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
            ['wish_count', 'INT'],
            ['card_oracle_main_name', 'VARCHAR(255)'],
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
            ['binder_type', 'TINYINT'],
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
            ['binder_rent', 'INT'],
        ],
        'PRIMARY_KEY': 'id',
        'FOREIGN_KEY': [
            ['card_id', 'card_infos(scryfall_id)'],
            ['binder_id', 'binder_infos(id)'],
            ['binder_rent', 'binder_infos(id)'],
        ],
    },
    {
        'NAME': 'ghost_cards',
        'COLUMNS': [
            ['id', 'INT AUTO_INCREMENT'],
            ['count', 'INT'],
            ['card_oracle_id', 'VARCHAR(36)'],
            ['ghost_binder_id', 'INT'],
        ],
        'PRIMARY_KEY': 'id',
        'FOREIGN_KEY': [
            ['card_oracle_id', 'card_oracle_infos(scryfall_id)'],
            ['ghost_binder_id', 'binder_infos(id)'],
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

const QUERY_FOREIGN_KEY_COLUMNS = `
    SELECT TABLE_NAME AS t, COLUMN_NAME AS c
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA="card_collection"`;

function buildAddForeignKeyQuery(existing) {
    return TABLE_DEFINITIONS
        .filter(table => 'FOREIGN_KEY' in table)
        .map(table => {return {
            "table": table.NAME,
            "foreign_keys": table.FOREIGN_KEY.filter(
                col => !existing.some(row => row.t === table.NAME && row.c === col[0])
            ),
        }})
        .filter(table => table.foreign_keys.length !== 0)
        .map(table => `
            ALTER TABLE ${table.table}
            ${table.foreign_keys.map(col => `ADD FOREIGN KEY (${col[0]}) REFERENCES ${col[1]}`).join(',')};`)
        .join('');
}

// No user input allowed!
function buildAlterTableQuery(existingColumns, existingKeys) {
    return buildAddColumnQuery(existingColumns) + buildAddForeignKeyQuery(existingKeys);
}

const INSERT_INTO_BINDERS_QUERY = `
INSERT INTO binder_infos(binder_name, binder_type) VALUES(?, IFNULL(?, 1));
SELECT LAST_INSERT_ID() AS id;
`;

const GET_BINDERS_QUERY = `
    SELECT
        binder_infos.id,
        binder_infos.binder_name,
        IFNULL(binder_infos.binder_type, 1) AS binder_type,
        COUNT(cards_collection.id) AS card_count,
        SUM(CASE WHEN cards_collection.binder_rent <> binder_infos.id THEN 1 ELSE 0 END) AS rent_count
    FROM binder_infos
    LEFT JOIN cards_collection 
    ON binder_infos.id IN (cards_collection.binder_rent, cards_collection.binder_id)
    GROUP BY binder_infos.id
`;
const RENAME_BINDER_QUERY = `UPDATE binder_infos SET binder_name = ? WHERE id = ?`;
const CHANGE_BINDER_TYPE_QUERY = `UPDATE binder_infos SET binder_type = ? WHERE id = ?`;

const DELETE_BINDERS_QUERY = `
DELETE FROM ghost_cards WHERE ghost_binder_id = ?;
UPDATE cards_collection SET binder_rent = NULL WHERE binder_rent = ?;
UPDATE cards_collection SET binder_id = 1, binder_rent = NULL WHERE binder_id = ?;
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
        set_infos.set_name AS set_name,
        card_infos.collectors_id AS collectors_id
    FROM card_infos
    JOIN card_oracle_infos ON card_infos.oracle_id = card_oracle_infos.scryfall_id
    JOIN set_infos ON card_infos.set_id = set_infos.scryfall_id
    WHERE card_oracle_infos.constructed = 1
        ${en_only?"AND card_infos.lang = 'en'":''}
        AND (UPPER(card_oracle_infos.card_oracle_name) LIKE concat(${front_match? "'%', ": ''}UPPER(?), '%')
            OR UPPER(card_oracle_infos.card_oracle_main_name) LIKE concat(${front_match? "'%', ": ''}UPPER(?), '%'))
    ${limit? 'LIMIT ' + limit: ''}
    `;
}

const ADD_CARD_TO_COLLECTION_QUERY = `INSERT INTO cards_collection(card_id, version, binder_id) VALUES(?, ?, ?)`;
const DELETE_CARD_IN_COLLECTION_QUERY = `DELETE FROM cards_collection WHERE id = ?`;
const MOVE_CARD_TO_ANOTHER_BINDER_QUERY = `
UPDATE cards_collection
SET 
    binder_id = ?,
    binder_rent = NULL
WHERE id = ?`;
const RENT_CARD_TO_BINDER_QUERY = `UPDATE cards_collection SET binder_rent = ? WHERE binder_id <> ? AND id = ?`;
const RETURN_CARD_TO_ORIGIN_BINDER_QUERY = `UPDATE cards_collection SET binder_rent = NULL WHERE id = ?`;

const RETURN_ALL_CARD_TO_ORIGIN_BINDER_QUERY = `
UPDATE cards_collection, (
	SELECT id 
    FROM cards_collection 
    WHERE binder_rent = ?
) AS temp
SET cards_collection.binder_rent = NULL
WHERE cards_collection.id = temp.id
`;

const ADD_CARD_TO_GHOST_DECK_QUERY = `
INSERT INTO ghost_cards(count, card_oracle_id, ghost_binder_id)
SELECT ?, scryfall_id, ?
FROM card_oracle_infos
WHERE (card_oracle_name = ?
    OR card_oracle_main_name = ?)
    AND constructed = 1
`;

const ADD_CARD_TO_GENERIC_WISHLIST_QUERY = `
UPDATE card_oracle_infos,
(
	SELECT scryfall_id AS id
    FROM card_oracle_infos
	WHERE (card_oracle_name = ?
        OR card_oracle_main_name = ?)
        AND constructed = 1
) AS temp
SET wish_count = GREATEST(IFNULL(wish_count, 0), ?)
WHERE card_oracle_infos.scryfall_id = temp.id
`;

const LIST_CARDS_IN_GENERIC_WISHLIST_QUERY = `
SELECT
    card_oracle_infos.card_oracle_name AS name,
    card_oracle_infos.wish_count,
    IFNULL(COUNT(cards_collection.card_id), 0) AS collection_count
FROM cards_collection
RIGHT JOIN card_infos ON cards_collection.card_id = card_infos.scryfall_id
JOIN card_oracle_infos ON card_infos.oracle_id = card_oracle_infos.scryfall_id
WHERE card_oracle_infos.wish_count > 0
GROUP BY card_infos.oracle_id
`;

const CLEANUP_CARDS_IN_GENERIC_WISHLIST_QUERY = `
UPDATE card_oracle_infos, (
	SELECT id FROM (
		SELECT
			card_oracle_infos.scryfall_id AS id,
			card_oracle_infos.wish_count,
			IFNULL(COUNT(cards_collection.card_id), 0) AS collection_count
		FROM cards_collection
		RIGHT JOIN card_infos ON cards_collection.card_id = card_infos.scryfall_id
		JOIN card_oracle_infos ON card_infos.oracle_id = card_oracle_infos.scryfall_id
		WHERE card_oracle_infos.wish_count > 0
		GROUP BY card_infos.oracle_id
	) AS temp
	WHERE temp.wish_count <= temp.collection_count
) AS fulfilled
SET card_oracle_infos.wish_count = 0
WHERE card_oracle_infos.scryfall_id = fulfilled.id
`;

const LIST_CARDS_IN_GHOST_DECK_QUERY = `
SELECT
    card_oracle_infos.card_oracle_name AS name,
    SUM(count) AS count
FROM ghost_cards
JOIN card_oracle_infos ON ghost_cards.card_oracle_id = card_oracle_infos.scryfall_id
WHERE ghost_binder_id = ?
GROUP BY card_oracle_id
`;

const LIST_AUTO_BUILD_FOR_GHOST_DECK_QUERY = `
SELECT
    id,
    version,
    binder_id,
    card_id,
    name,
    image,
    printed_name,
    language,
    set_name,
    collectors_id
FROM (
    SELECT
        id,
        version,
        binder_id,
        card_id,
        name,
        image,
        printed_name,
        language,
        set_name,
        collectors_id,
        count_limit,
        (@rn:=if(@prev = oracle_id, @rn +1, 1)) as rownumb,
        @prev:= oracle_id
    FROM (
        SELECT
            cards_collection.id AS id,
            cards_collection.version AS version,
            IFNULL(cards_collection.binder_rent, cards_collection.binder_id) AS binder_id,
            card_infos.scryfall_id AS card_id,
            card_infos.card_name AS name,
            card_infos.scryfall_image_uri AS image,
            card_infos.card_printed_name AS printed_name,
            card_infos.lang AS language,
            set_infos.set_name AS set_name,
            card_infos.collectors_id AS collectors_id,
            card_infos.oracle_id AS oracle_id,
            ghost.count AS count_limit
        FROM cards_collection
        JOIN card_infos ON cards_collection.card_id = card_infos.scryfall_id
        JOIN set_infos ON card_infos.set_id = set_infos.scryfall_id
        JOIN (
            SELECT
                card_oracle_id,
                SUM(count) AS count
            FROM ghost_cards
            WHERE ghost_binder_id = ?
            GROUP BY card_oracle_id
        ) AS ghost ON ghost.card_oracle_id = card_infos.oracle_id
        ORDER BY oracle_id, binder_id ASC
    ) AS sorted_all_cards
    JOIN (select @prev:=NULL, @rn :=0) AS vars
) AS grouped_list
WHERE rownumb <= count_limit
`;

function buildListCardsInBinderQuery(all_binders) {
    return `
    SELECT
        cards_collection.id AS id,
        cards_collection.version AS version,
        IFNULL(cards_collection.binder_rent, cards_collection.binder_id) AS binder_id,
        card_infos.scryfall_id AS card_id,
        card_infos.card_name AS name,
        card_infos.scryfall_image_uri AS image,
        card_infos.card_printed_name AS printed_name,
        card_infos.lang AS language,
        set_infos.set_name AS set_name,
        card_infos.collectors_id AS collectors_id
    FROM cards_collection
    JOIN card_infos ON cards_collection.card_id = card_infos.scryfall_id
    JOIN set_infos ON card_infos.set_id = set_infos.scryfall_id
    ${all_binders? '': 'WHERE ? IN (cards_collection.binder_rent, cards_collection.binder_id)'}
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
    ${all_binders? '': 'WHERE IFNULL(cards_collection.binder_rent, cards_collection.binder_id) = ?'}
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
        constructed,
        card_oracle_main_name
    )
    VALUES${new Array(count).fill('(?, ?, ?, ?)').join(', ')}
    ON DUPLICATE KEY UPDATE
    card_oracle_name=VALUES(card_oracle_name),
    constructed=VALUES(constructed),
    card_oracle_main_name=VALUES(card_oracle_main_name)`;
}

COUNT_CARDS_IN_COLLECTION_BY_NAME_QUERY = `
SELECT
    card_oracle_infos.card_oracle_name AS name,
    card_oracle_infos.card_oracle_main_name AS main_name,
    IFNULL(COUNT(cards_collection.card_id), 0) AS count
FROM cards_collection
RIGHT JOIN card_infos ON cards_collection.card_id = card_infos.scryfall_id
JOIN card_oracle_infos ON card_infos.oracle_id = card_oracle_infos.scryfall_id
WHERE card_oracle_infos.card_oracle_name IN (?)
    OR card_oracle_infos.card_oracle_main_name IN (?)
GROUP BY card_infos.oracle_id
`;

module.exports = {
    CREATE_TABLES,
    QUERY_TABLE_COLUMNS,
    QUERY_FOREIGN_KEY_COLUMNS,
    INSERT_INTO_BINDERS_QUERY,
    GET_BINDERS_QUERY,
    RENAME_BINDER_QUERY,
    CHANGE_BINDER_TYPE_QUERY,
    DELETE_BINDERS_QUERY,
    ADD_CARD_TO_COLLECTION_QUERY,
    DELETE_CARD_IN_COLLECTION_QUERY,
    MOVE_CARD_TO_ANOTHER_BINDER_QUERY,
    RENT_CARD_TO_BINDER_QUERY,
    RETURN_CARD_TO_ORIGIN_BINDER_QUERY,
    RETURN_ALL_CARD_TO_ORIGIN_BINDER_QUERY,
    ADD_CARD_TO_GHOST_DECK_QUERY,
    ADD_CARD_TO_GENERIC_WISHLIST_QUERY,
    LIST_CARDS_IN_GENERIC_WISHLIST_QUERY,
    CLEANUP_CARDS_IN_GENERIC_WISHLIST_QUERY,
    COUNT_CARDS_IN_COLLECTION_BY_NAME_QUERY,
    LIST_CARDS_IN_GHOST_DECK_QUERY,
    LIST_AUTO_BUILD_FOR_GHOST_DECK_QUERY,
    buildAlterTableQuery,
    buildQueryCardInfoByName,
    buildListCardsInBinderQuery,
    buildCountCardsInBinderQuery,
    buildInsertOrUpdateCardMetadataTableQuery,
    buildInsertOrUpdateSetMetadataTableQuery,
    buildInsertOrUpdateOracleMetadataTableQuery,
    formCardMetadataQueryValues,
    formCardMetadataQueryValuesFromCardObject,
};