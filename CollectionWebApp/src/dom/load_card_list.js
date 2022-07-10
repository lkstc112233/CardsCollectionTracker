const { createCardDom, createCardInfoDom } = require('./create_card');
const grpc = require('../grpc');
const DragSelect = require('dragselect');

async function loadBinderDom(binder = 0) {
    listResponse = await grpc.listAllBinderCards(binder);
    document.getElementById('cards-collection').innerHTML = listResponse.getCardsList()
        .map(card => createCardDom(card))
        .map(cardDom => '<div class="drag-card">' + cardDom + '</div>')
        .join('');
    new DragSelect({
        selectables: document.getElementsByClassName('drag-card')
    });
}

async function loadSearchAddListDom(query = '') {
    // Search is not performed for empty query.
    if (query === '') {
        return;
    }
    listResponse = await grpc.queryCardInfoByName(query);
    document.getElementById('search-add-list')
        .replaceChildren(...listResponse.getInfoList().map(card => createCardInfoDom(card)));
}

module.exports = {
    loadBinderDom,
    loadSearchAddListDom,
}