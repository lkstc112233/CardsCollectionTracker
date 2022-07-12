const { createCardDom, createCardInfoDom } = require('./create_card');
const grpc = require('../grpc');
const DragSelect = require('dragselect');
const bottomBar = require('./bottom_bar');

const ds = new DragSelect({});
ds.subscribe('callback', (callbackObj) => {
    if (!callbackObj.isDragging) {
        return;
    }
    callbackObj.items.forEach(element => {
        element.style.transform = '';
    });
    if (bottomBar.getCurrentBottomBinder() === null) {
        return;
    }
    triggerEvent = callbackObj.event;
    elemBelow = document.elementFromPoint(triggerEvent.clientX, triggerEvent.clientY);
    if (elemBelow == document.getElementById('binder-droparea')) {
        Promise.all(callbackObj.items
            .filter(element => element.childElementCount > 0)
            .map(element => element.firstChild)
            .filter(element => element.className === 'card-box')
            .map(element => {
                id = element.id.match(cardIdFromElemId)[1];
                return grpc.moveCardToAnotherBinder(id, bottomBar.getCurrentBottomBinder())
                    .then(() => element.parentElement);
            })).then((arr) => {
                arr.forEach(element => element.remove());
            });
    }
});
const cardIdFromElemId = /-(\d+)-/i;

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