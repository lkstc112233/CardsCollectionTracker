const waitPort = require('wait-port');
const mysql = require('mysql');
const fs = require('fs');
const queries = require('./queries');

const {
    MYSQL_HOST: HOST,
    MYSQL_USER: USER,
    MYSQL_PASSWORD: PASSWORD,
    MYSQL_PASSWORD_FILE: PASSWORD_FILE,
} = process.env;

let pool;

async function makeQuery(query, parameters) {
    if (!pool) {
        return Promise.reject('Called before connection is made.');
    }
    return new Promise((acc, rej) => {
        pool.query(
            query,
            parameters,
            (err, rows) => {
                if (err) return rej(err);
                acc(rows);
            },
        );
    })
}

async function teardown() {
    return new Promise((acc, rej) => {
        pool.end(err => {
            if (err) rej(err);
            else acc();
        });
    });
}

async function init() {
    const host = HOST;
    const user = USER ? USER : 'root';
    const password = PASSWORD_FILE ? fs.readFileSync(PASSWORD_FILE) : PASSWORD;
    const database = 'card_collection';

    await waitPort({ host, port : 3306});

    pool = mysql.createPool({
        connectionLimit: 5,
        host,
        user,
        password,
        database,
        charset: 'utf8mb4',
        multipleStatements: true,
    });

    await makeQuery(queries.CREATE_TABLES);
    const [tableColumnRows, tableForeignKeyRows] = await Promise.all([
        makeQuery(queries.QUERY_TABLE_COLUMNS),
        makeQuery(queries.QUERY_FOREIGN_KEY_COLUMNS),
    ]);
    var query = queries.buildAlterTableQuery(tableColumnRows, tableForeignKeyRows);
    if (query.trim().length === 0) {
        console.log(`Connected to mysql db at host ${HOST}`);
        return Promise.resolve();
    }
    await makeQuery(query);
    console.log(`Connected to mysql db at host ${HOST}`);
}

async function updateCardObjectsMetadata(cardList) {
    if (!Array.isArray(cardList) || cardList.length < 1) {
        return Promise.reject('Input is not list.');
    }

    return makeQuery(
        queries.buildInsertOrUpdateCardMetadataTableQuery(cardList.length),
        cardList.flatMap(obj => queries.formCardMetadataQueryValuesFromCardObject(obj)));
}

async function updateSetObjectsMetadata(setList) {
    if (!Array.isArray(setList) || setList.length < 1) {
        return Promise.reject('Input is not list.');
    }
    return makeQuery(
        queries.buildInsertOrUpdateSetMetadataTableQuery(setList.length),
        setList.flatMap(obj => [obj.id, obj.name, obj.code, obj.uri, obj.icon_svg_uri]));
}

async function updateOracleObjectsMetadata(oracleList) {
    if (!Array.isArray(oracleList) || oracleList.length < 1) {
        return Promise.reject('Input is not list.');
    }
    return makeQuery(
        queries.buildInsertOrUpdateOracleMetadataTableQuery(oracleList.length),
        oracleList.flatMap(obj => [obj.id, obj.name, obj.is_constructed, obj.main_name]));
}

async function addBinder(name, type) {
    return makeQuery(queries.INSERT_INTO_BINDERS_QUERY, [name, type]);
}

async function renameBinder(id, newName) {
    return makeQuery(queries.RENAME_BINDER_QUERY, [newName, id]);
}

async function changeBinderType(id, newType) {
    return makeQuery(queries.CHANGE_BINDER_TYPE_QUERY, [newType, id]);
}

async function deleteBinder(id) {
    if (id === 1) {
        return Promise.reject('Unbinded binder cannot be deleted.');
    }
    return makeQuery(queries.DELETE_BINDERS_QUERY, [id, id, id, id]);
}

async function queryBinders() {
    return makeQuery(queries.GET_BINDERS_QUERY);
}

async function queryCardsInfoByName(card_name, en_only, front_match, limit) {
    return makeQuery(
        queries.buildQueryCardInfoByName(en_only, front_match, limit),
        [card_name, card_name]);
}

async function listCardInBinder(binder_id) {
    return makeQuery(
        queries.buildListCardsInBinderQuery(binder_id === 0),
        binder_id === 0? []: [binder_id]);
}

async function countCardsInBinder(binder_id) {
    return makeQuery(
        queries.buildCountCardsInBinderQuery(binder_id === 0),
        binder_id === 0? []: [binder_id]);
}

async function addCardToCollection(card_id, version, binder_id = 1) {
    if (version === 'nonfoil' || version === '') {
        version = null;
    }
    if (binder_id == 0) {
        binder_id = 1;
    }
    return makeQuery(queries.ADD_CARD_TO_COLLECTION_QUERY, [card_id, version, binder_id]);
}

async function deleteCardInCollection(id) {
    return makeQuery(queries.DELETE_CARD_IN_COLLECTION_QUERY, [id]);
}

async function moveCardToAnotherBinder(id, new_binder) {
    return makeQuery(queries.MOVE_CARD_TO_ANOTHER_BINDER_QUERY, [new_binder, id]);
}

async function rentCardToBinder(id, dest_binder) {
    return makeQuery(queries.RENT_CARD_TO_BINDER_QUERY, [dest_binder, dest_binder, id]);
}

async function returnCardToOriginBinder(id) {
    return makeQuery(queries.RETURN_CARD_TO_ORIGIN_BINDER_QUERY, [id]);
}

async function returnAllCardsToOriginBinder(binder_id) {
    return makeQuery(queries.RETURN_ALL_CARD_TO_ORIGIN_BINDER_QUERY, [binder_id]);
}

// Only increase the count.
async function addCardToGenericWishlist(card_name, count) {
    return makeQuery(queries.ADD_CARD_TO_GENERIC_WISHLIST_QUERY, [card_name, card_name, count]);
}

// Only increase the count.
async function addAllCardsToGenericWishlist(card_list) {
    return Promise.all(card_list.map(card => 
        addCardToGenericWishlist(card.wished_card.card_info.name, card.count)));
}

async function listCardsInGenericWishlist() {
    return makeQuery(queries.LIST_CARDS_IN_GENERIC_WISHLIST_QUERY);
}

async function cleanupCardsInGenericWishlist() {
    return makeQuery(queries.CLEANUP_CARDS_IN_GENERIC_WISHLIST_QUERY);
}

async function countCardsInCollection(names) {
    return makeQuery(queries.COUNT_CARDS_IN_COLLECTION_BY_NAME_QUERY, [names, names]);
}

module.exports = {
    init,
    teardown,
    updateCardObjectsMetadata,
    updateSetObjectsMetadata,
    updateOracleObjectsMetadata,
    addBinder,
    renameBinder,
    changeBinderType,
    deleteBinder,
    queryBinders,
    queryCardsInfoByName,
    listCardInBinder,
    countCardsInBinder,
    addCardToCollection,
    deleteCardInCollection,
    moveCardToAnotherBinder,
    rentCardToBinder,
    returnCardToOriginBinder,
    returnAllCardsToOriginBinder,
    addCardToGenericWishlist,
    addAllCardsToGenericWishlist,
    listCardsInGenericWishlist,
    cleanupCardsInGenericWishlist,
    countCardsInCollection,
};