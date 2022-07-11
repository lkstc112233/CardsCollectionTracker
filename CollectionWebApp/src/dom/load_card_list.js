const { createCardDom, createCardInfoDom } = require('./create_card');
const grpc = require('../grpc');
const DragSelect = require('dragselect');

const ds = new DragSelect({});

async function loadBinderDom(binder = 0) {
    listResponse = await grpc.listAllBinderCards(binder);
    cardsList = listResponse.getCardsList()
        .map(card => createCardDom(card))
        .map(cardDom => {
            var dragCardElem = document.createElement('div');
            dragCardElem.className = 'drag-card';
            dragCardElem.appendChild(cardDom);
            return dragCardElem;
        });
    document.getElementById('cards-collection').replaceChildren(...cardsList);
    ds.setSelectables(cardsList, /* removeFromSelection */ true);
    ds.subscribe('callback', (callbackObj) => {
        if (!callbackObj.isDragging) {
            return;
        }
        callbackObj.items.forEach(element => {
            element.style.transform = '';
        });
        triggerEvent = callbackObj.event;
        elemBelow = document.elementFromPoint(triggerEvent.clientX, triggerEvent.clientY);
        if (elemBelow == document.getElementById('binder-droparea')) {
            console.log('Dropped within area');
        } else {
            console.log('Dropped without area');
        }
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