const { createCardDom, createCardInfoDom } = require('./create_card');
const grpc = require('../grpc');
const DragSelect = require('dragselect');
const bottomBar = require('./bottom_bar');

const ds = new DragSelect({});
const cardIdFromElemId = /-(\d+)-/i;
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

async function loadBinderDom(binder = 0) {
    listResponse = await grpc.listAllBinderCards(binder);
    cardsList = listResponse.getCardsList()
        .map(card => createCardDom(card))
        .map(cardDom => {
            var dragCardElem = document.createElement('div');
            dragCardElem.className = 'drag-card';
            dragCardElem.appendChild(cardDom);
            cardDom.oncontextmenu = function() {
                elemsToDelete = ds.getSelection();
                if (!elemsToDelete.find(elem => elem === dragCardElem)) {
                    elemsToDelete.push(dragCardElem);
                }
                if (!confirm(`Are you sure to delete ${elemsToDelete.length} card${elemsToDelete>1?'s':''} from your collection?\nThis operation cannot be reverted!`)) {
                    return false;
                }
                Promise.all(elemsToDelete
                    .filter(element => element.childElementCount > 0)
                    .map(element => element.firstChild)
                    .filter(element => element.className === 'card-box')
                    .map(element => {
                        id = element.id.match(cardIdFromElemId)[1];
                        return grpc.deleteCardInCollection(id).then(() => element.parentElement);
                    })).then((arr) => {
                        arr.forEach(element => {
                            element.remove();
                        });
                    });
                return false;
            };
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