const CREATE_TABLES = `CREATE TABLE IF NOT EXISTS card_infos (
    scryfall_id VARCHAR(36) PRIMARY KEY,
    card_name VARCHAR(255) KEY,
    card_printed_name VARCHAR(255),
    lang VARCHAR(10),
    scryfall_api_uri VARCHAR(70),
    scryfall_card_url VARCHAR(255),
    scryfall_image_uri VARCHAR(255),
    version VARCHAR(50),
    reference_usd_cent_price INT
) DEFAULT CHARSET utf8mb4`;

module.exports = {
    CREATE_TABLES,
};