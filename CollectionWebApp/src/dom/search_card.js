const { clearAllPlaceholders } = require('./clear_placeholders');
const { loadSearchAddListDom, loadWishSearchAddListDom } = require('./load_card_list');

function createSearchCardElements(addToWish = false) {
    if (addToWish) {
        createWishSearchCardElements();
    } else {
        createBinderSearchCardElements();
    }
}

function createBinderSearchCardElements() {
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

function createWishSearchCardElements() {
    clearAllPlaceholders();
    document.getElementById('search-add-box').innerHTML = `
        <input id="search-add-box-input"/>
    `;
    var input = document.getElementById('search-add-box-input');
    input.addEventListener('input', elem => {
        loadWishSearchAddListDom(elem.target.value);
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