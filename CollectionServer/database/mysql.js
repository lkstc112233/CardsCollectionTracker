const waitPort = require('wait-port');
const mysql = require('mysql');
const queries = require('./queries');

const {
    MYSQL_HOST: HOST,
    MYSQL_USER: USER,
    MYSQL_PASSWORD: PASSWORD,
} = process.env;

let pool;

async function init() {
    const host = HOST;
    const user = USER;
    const password = PASSWORD;
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

    return new Promise((acc, rej) => {
        pool.query(
            queries.CREATE_TABLES,
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
        pool.query(
            queries.DELETE_BINDERS_QUERY,
            [id],
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

async function queryCardsInfoByName(card_name, en_only, front_match) {
    return new Promise((acc, rej) => {
        pool.query(
            queries.buildQueryCardInfoByName(en_only, front_match),
            [card_name],
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
    addCardToCollection,
};