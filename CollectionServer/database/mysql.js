const waitPort = require('wait-port');
const mysql = require('mysql');
const queries = require('./queries');

const {
    MYSQL_HOST: HOST,
    MYSQL_USER: USER,
    MYSQL_PASSWORD: PASSWORD,
} = process.env;


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

async function updateCardMetadata(id, card_name, language, scryfall_api_uri, scryfall_card_url, args) {
    return new Promise((acc, rej) => {
        pool.query(
            queries.INSERT_INTO_OR_UPDATE_METADATA_TABLE_QUERY,
            queries.formCardMetadataQueryValues(id, card_name, language, scryfall_api_uri, scryfall_card_url, args),
            err => {
                if (err) return rej(err);

                console.log(`Insert succeed.`);
                acc();
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

module.exports = {
    init,
    teardown,
    updateCardMetadata,
};