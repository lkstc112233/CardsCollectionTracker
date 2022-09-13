const { clearAllPlaceholders } = require('./clear_placeholders');
const { loadSearchAddListDom } = require('./load_card_list');

function createSearchCardElements() {
    clearAllPlaceholders();
    document.getElementById('search-add-box').innerHTML = `
        <input id="search-add-box-input"/>
    `;
    var input = document.getElementById('search-add-box-input');
    input.addEventListener('input', elem => {
        loadSearchAddListDom(elem.target.value);
    });
    input.addEventListener('keydown', e => {
        if (e.code == 'Escape') {
            input.focus();
            input.select();
        }
    });
}

module.exports = {
    createSearchCardElements,
}