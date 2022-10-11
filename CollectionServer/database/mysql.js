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

    await new Promise((acc, rej) => {
        pool.query(
            queries.CREATE_TABLES,
            err => {
                if (err) return rej(err);

                console.log(`Connected to mysql db at host ${HOST}`);
                acc();
            },
        );
    });
    tableColumnRows = await new Promise((acc, rej) => {
        pool.query(
            queries.QUERY_TABLE_COLUMNS,
            (err, rows) => {
                if (err) return rej(err);
                acc(rows);
            },
        );
    });
    return new Promise((acc, rej) => {
        var query = queries.buildAddColumnQuery(tableColumnRows);
        if (query.trim().length === 0) {
            acc();
        }
        pool.query(
            queries.buildAddColumnQuery(tableColumnRows),
            err => {
                if (err) return rej(err);

                console.log(`Connected to mysql db at host ${HOST}`);
                acc();
            },
        );
    });
}

async function updateCardObjectsMetadata(cardList) {
    return new Promise((acc, rej) => {
        if (!Array.isArray(cardList) || cardList.length < 1) {
            rej('Input is not list.');
        }
        pool.query(
            queries.buildInsertOrUpdateCardMetadataTableQuery(cardList.length),
            cardList.flatMap(obj => queries.formCardMetadataQueryValuesFromCardObject(obj)),
            err => {
                if (err) return rej(err);
                acc();
            },
        );
    });
}

async function updateSetObjectsMetadata(setList) {
    return new Promise((acc, rej) => {
        if (!Array.isArray(setList) || setList.length < 1) {
            rej('Input is not list.');
        }
        pool.query(
            queries.buildInsertOrUpdateSetMetadataTableQuery(setList.length),
            setList.flatMap(obj => [obj.id, obj.name, obj.code, obj.uri, obj.icon_svg_uri]),
            err => {
                if (err) return rej(err);
                acc();
            },
        );
    });
}

async function updateOracleObjectsMetadata(oracleList) {
    return new Promise((acc, rej) => {
        if (!Array.isArray(oracleList) || oracleList.length < 1) {
            rej('Input is not list.');
        }
        pool.query(
            queries.buildInsertOrUpdateOracleMetadataTableQuery(oracleList.length),
            oracleList.flatMap(obj => [obj.id, obj.name, obj.is_constructed]),
            err => {
                if (err) return rej(err);
                acc();
            },
        );
    });
}

async function addBinder(name) {
    return new Promise((acc, rej) => {
        pool.query(
            queries.INSERT_INTO_BINDERS_QUERY,
            [name],
            err => {
                if (err) return rej(err);
                acc();
            },
        );
    });
}

async function renameBinder(id, newName) {
    return new Promise((acc, rej) => {
        pool.query(
            queries.RENAME_BINDER_QUERY,
            [newName, id],
            err => {
                if (err) return rej(err);
                acc();
            },
        );
    });
}

async function deleteBinder(id) {
    return new Promise((acc, rej) => {
        if (id === 1) {
            rej('Unbinded binder cannot be deleted.');
        }
        pool.query(
            queries.DELETE_BINDERS_QUERY,
            [id, id],
            err => {
                if (err) return rej(err);
                acc();
            },
        );
    });
}

async function queryBinders() {
    return new Promise((acc, rej) => {
        pool.query(
            queries.GET_BINDERS_QUERY,
            (err, rows) => {
                if (err) return rej(err);
                acc(rows);
            },
        );
    });
}

async function teardown() {
    return new Promise((acc, rej) => {
        pool.end(err => {
            if (err) rej(err);
            else acc();
        });
    });
}

async function queryCardsInfoByName(card_name, en_only, front_match, limit) {
    return new Promise((acc, rej) => {
        pool.query(
            queries.buildQueryCardInfoByName(en_only, front_match, limit),
            [card_name],
            (err, rows) => {
                if (err) return rej(err);
                acc(rows);
            },
        );
    });
}

async function listCardInBinder(binder_id) {
    return new Promise((acc, rej) => {
        pool.query(
            queries.buildListCardsInBinderQuery(binder_id === 0),
            binder_id === 0? []: [binder_id],
            (err, rows) => {
                if (err) return rej(err);
                acc(rows);
            },
        );
    });
}

async function countCardsInBinder(binder_id) {
    return new Promise((acc, rej) => {
        pool.query(
            queries.buildCountCardsInBinderQuery(binder_id === 0),
            binder_id === 0? []: [binder_id],
            (err, rows) => {
                if (err) return rej(err);
                acc(rows);
            },
        );
    });
}

async function addCardToCollection(card_id, version, binder_id = 1) {
    if (version === 'nonfoil' || version === '') {
        version = null;
    }
    if (binder_id == 0) {
        binder_id = 1;
    }
    return new Promise((acc, rej) => {
        pool.query(
            queries.ADD_CARD_TO_COLLECTION_QUERY,
            [card_id, version, binder_id],
            (err, rows) => {
                if (err) return rej(err);
                acc(rows);
            },
        );
    });
}

async function deleteCardInCollection(id) {
    return new Promise((acc, rej) => {
        pool.query(
            queries.DELETE_CARD_IN_COLLECTION_QUERY,
            [id],
            err => {
                if (err) return rej(err);
                acc();
            },
        );
    });
}

async function moveCardToAnotherBinder(id, new_binder) {
    return new Promise((acc, rej) => {
        pool.query(
            queries.MOVE_CARD_TO_ANOTHER_BINDER_QUERY,
            [new_binder, id],
            err => {
                if (err) return rej(err);
                acc();
            },
        );
    });
}

// Only increase the count.
async function addCardToGenericWishlist(card_name, count) {
    return new Promise((acc, rej) => {
        pool.query(
            queries.ADD_CARD_TO_GENERIC_WISHLIST_QUERY,
            [card_name, count],
            err => {
                if (err) return rej(err);
                acc();
            },
        );
    });
}

// Only increase the count.
async function addAllCardsToGenericWishlist(card_list) {
    return Promise.all(card_list.map(card => 
        addCardToGenericWishlist(card.wished_card.card_info.name, card.count)));
}

async function countCardsInCollection(names) {
    return new Promise((acc, rej) => {
        pool.query(
            queries.COUNT_CARDS_IN_COLLECTION_BY_NAME_QUERY,
            [names],
            (err, rows) => {
                if (err) return rej(err);
                acc(rows);
            },
        );
    });
}

module.exports = {
    init,
    teardown,
    updateCardObjectsMetadata,
    updateSetObjectsMetadata,
    updateOracleObjectsMetadata,
    addBinder,
    renameBinder,
    deleteBinder,
    queryBinders,
    queryCardsInfoByName,
    listCardInBinder,
    countCardsInBinder,
    addCardToCollection,
    deleteCardInCollection,
    moveCardToAnotherBinder,
    addCardToGenericWishlist,
    addAllCardsToGenericWishlist,
    countCardsInCollection,
};