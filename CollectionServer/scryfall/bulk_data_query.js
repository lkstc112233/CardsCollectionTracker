const cards_query = require('./bulk_cards_query');
const set_query = require('./bulk_set_query');
const oracle_query = require('./bulk_oracle_query');

const DEFAULT_BATCH_SIZE = 1000;

async function handleAllMetadata(batch_size = DEFAULT_BATCH_SIZE) {
    const set_count = await set_query.handleAllSets(batch_size);
    const oracle_count = await oracle_query.handleAllOracle(batch_size);
    const cards_count = await cards_query.handleAllCards(batch_size);
    return {set_count, oracle_count, cards_count};
}

module.exports = {handleAllMetadata};