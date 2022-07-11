const { createCardDom, createCardInfoDom } = require('./create_card');
const grpc = require('../grpc');
const DragSelect = require('dragselect');

const ds = new DragSelect({});

async function loadBinderDom(binder = 0) {
    listResponse = await grpc.listAllBinderCards(binder);
    document.getElementById('cards-collection').innerHTML = listResponse.getCardsList()
        .map(card => createCardDom(card))
        .map(cardDom => '<div class="drag-card">' + cardDom + '</div>')
        .join('');
    ds.setSelectables(document.getElementsByClassName('drag-card'), /* removeFromSelection */ true);
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