const { clearAllPlaceholders } = require('./clear_placeholders');
const { loadSearchAddListDom } = require('./load_card_list');

function createSearchCardElements() {
    clearAllPlaceholders();
    document.getElementById('search-add-box').innerHTML = `
        <input id="search-add-box-input"/>
    `;
    document.getElementById('search-add-box-input')
        .addEventListener('input', elem => {
            loadSearchAddListDom(elem.target.value);
        });
}

module.exports = {
    createSearchCardElements,
}