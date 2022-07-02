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

module.exports = {
    CREATE_TABLES,
};